import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {  Text, FlatList, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components/native'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { Button, ProgressBar, List } from 'react-native-paper'
import Constants from 'expo-constants'
import { downloadComic, WebsiteIsNotSupported } from 'comic-downloader-core'
import { RootStackParamList } from '.'
import { useContext } from 'react'
import { localeContext, LocaleContext } from '../locales/LocaleContext'
import locales from '../locales'
import filenamify from 'filenamify/filenamify'
import { downloadSlice, DOWNLOAD_STATE, StoreState } from 'comic-downloader-core'

type DownloadInfoScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: DownloadInfoScreenRouteProp;
}

const chaptersDir = FileSystem.cacheDirectory + 'chapters/';
const defaultAlbumName = 'Comic Downloader';

export default function DownloadInfo({ navigation }: Props) {
    const dispatch = useDispatch();
    const state: StoreState = useSelector((state: StoreState) => state);
    const { locale } = useContext(localeContext) as LocaleContext;

    const dir = chaptersDir + filenamify(state.chapter.url) + '/';
    
    const [targetDir, setTargetDir] = useState<string>(dir);
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [siteName, setSiteName] = useState<string>('');
    const [areAllDownloadsComplete, setAreAllDownloadsComplete] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isWebsiteSupported, setIsWebsiteSupported] = useState<boolean>(true);
    const [isSavedToGallery, setIsSavedToGallery] = useState<boolean>(false);
    const [isSavingToGallery, setIsSavingToGallery] = useState<boolean>(false);
    const [uris, setUris] = useState<string[]>([]);

    const messages = locales[locale];

    useEffect(() => {
        startDownload()
            .catch(e => {
                console.error(e);
                setErrorMsg(e.toString());
            });
        
        return () => {
            dispatch(downloadSlice.actions.clearData());
        };
    }, []);

    useEffect(() => {
        // checks if all pages have been downloaded
        if (state.download.downloadStates.length === 0) {
            return;
        }
        
        let isFinished = true;
        for (const downloadState of state.download.downloadStates) {
            if (downloadState === DOWNLOAD_STATE.DOWNLOADING) {
                isFinished = false;
            }
        }

        setAreAllDownloadsComplete(isFinished);
    }, [state.download.downloadStates]);

    useEffect(() => {
        if (areAllDownloadsComplete && !isSavedToGallery) {
            moveFilesToGallery()
                .catch(e => {
                    console.error(e);
                    setErrorMsg(e.toString());
                });
        }
    }, [areAllDownloadsComplete])

    const startDownload = async () => {
        const messages = locales[locale];
        setErrorMsg('');
        
        await ensureDirExists();
                
        try {
            let namePrefix = replaceAll(state.chapter.chapterName.trim(), ' ', '_');
            if (namePrefix.length > 0) {
                namePrefix = `${namePrefix}-`
            }
            
            let pageUrl = state.chapter.url.trim();
            if (!pageUrl.startsWith('http')) {
                pageUrl = `http://${pageUrl}`;
            }
            
            const res = await downloadComic(pageUrl);
            setSiteName(res.websiteData.name);
            setImageLinks(res.images);
            setIsWebsiteSupported(true);
            
            const fileUris: string[] = new Array();
            dispatch(downloadSlice.actions.initDownloadStates(res.images.length));
            
            for (const imageLink of res.images) {
                const i = res.images.indexOf(imageLink);
                const numberOfDigits = String(res.images.length).length; 
                const pageNumber = `${i+1}`.padStart(numberOfDigits, '0');
                let fileName = `${namePrefix}${pageNumber}`;
                const fileExtension = imageLink.split('.').pop();
                if (fileExtension && fileExtension.length > 0) {
                    fileName = `${namePrefix}${pageNumber}.${fileExtension}`;
                }
                
                const fullPath = targetDir + fileName;
                fileUris.push(fullPath);
                downloadFile(imageLink, fullPath)
                    .then((url) => {
                        console.log(state.download.completeDownloads);
                        const index = res.images.indexOf(url);

                        const log = messages.pageDownloadedSuccessfully
                            .replace('{fileName}', fileName);
                        
                        dispatch(downloadSlice.actions.addLog(log));

                        dispatch(downloadSlice.actions.setDownloadState({
                            index,
                            downloadState: DOWNLOAD_STATE.SUCCESS,
                        }));
    
                        dispatch(downloadSlice.actions.incrementCompleteDownloads());
                    })
                    .catch(([url, e]) => {
                        const index = res.images.indexOf(url);

                        console.warn(e);
        
                        dispatch(downloadSlice.actions.addLog(String(e)));

                        dispatch(downloadSlice.actions.setDownloadState({
                            index,
                            downloadState: DOWNLOAD_STATE.ERROR,
                        }));

                        dispatch(downloadSlice.actions.incrementCompleteDownloads());
                    });
            }

            setUris([...fileUris]);
        }
        catch (e) {
            if (e instanceof WebsiteIsNotSupported) {
                setIsWebsiteSupported(false);
            }

            setErrorMsg(String(e));
        }
    };

    const moveFilesToGallery = async () => {
        setIsSavingToGallery(true);

        dispatch(downloadSlice.actions.addLog(messages.savingToGallery));

        let album = defaultAlbumName;
        if (state.chapter.albumName.trim().length > 0) {
            album = state.chapter.albumName;
        }

        try {
            const assets = await createAssets(uris);
            await addAssetsToAlbum(album, assets);
        }
        catch (e) {
            setErrorMsg(e.toString());
            return;
        }

        setIsSavingToGallery(false);
        setIsSavedToGallery(true);
    };

    const ensureDirExists = async (): Promise<void> => {
        const dirInfo = await FileSystem.getInfoAsync(targetDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
        }
    };

    const downloadFile = async (url: string, filePath: string): Promise<string> => {
        await FileSystem.downloadAsync(url, filePath);
        return url;
    };

    const createAssets = async (fileUris: string[]): Promise<MediaLibrary.Asset[]> => {
        const assetPromises = fileUris.map(fileUri => {
            return MediaLibrary.createAssetAsync(fileUri);
        });

        return Promise.all(assetPromises);
    };

    const addAssetsToAlbum = async (albumName: string, assets: MediaLibrary.Asset[]): Promise<void> => {
        let assetList = [...assets];
        if (assetList.length === 0) {
            return;
        }

        let album = await MediaLibrary.getAlbumAsync(albumName);
        if (!album) {
            album = await MediaLibrary.createAlbumAsync(albumName, assets[0], false);
            // remove the first item from the array
            assetList.shift();
        }

        await MediaLibrary.addAssetsToAlbumAsync(assetList, album, false);
    };
    
    const handleGoBackClick = () => {
        navigation.replace('Home')
    };

    const progress = (100 * state.download.completeDownloads) / imageLinks.length;

    if (errorMsg.length > 0) {
        // show error message
        return (
            <ViewContainer>
                {(!isWebsiteSupported) ? (
                    <LargeText>
                        {messages.websiteNotSupported}
                    </LargeText>
                ) : (
                    <LargeText>{errorMsg}</LargeText>
                )}

                <Button
                    mode="contained"
                    onPress={handleGoBackClick}
                >
                    {messages.goBack}
                </Button>
            </ViewContainer>
        );
    };

    return (
        <ViewContainer>
            <LargeText>
                {messages.downloadingChapterFrom.replace('{siteName}', siteName)}
            </LargeText>

            {(imageLinks.length === 0) && (
                <>
                    <Text>
                        {messages.fetchingData}
                    </Text>
                    <ProgressBarContainer>
                        <ProgressBar
                            indeterminate={true} 
                        />
                    </ProgressBarContainer>
                </>
            )}
            {(imageLinks.length > 0 && !areAllDownloadsComplete) && (
                <>
                    <Text>{messages.DownloadingFiles}</Text>
                    <Text>
                        {state.download.completeDownloads}/{imageLinks.length}
                    </Text>
                    <ProgressBarContainer>
                        <ProgressBar 
                            progress={progress/100} 
                        />
                    </ProgressBarContainer>
                </>
            )}
            {(isSavingToGallery) && (
                <>
                    <Text>
                        {messages.savingToGallery}
                    </Text>
                    <ProgressBarContainer>
                        <ProgressBar 
                            progress={progress/100} 
                        />
                    </ProgressBarContainer>
                </>
            )}
            {(isSavedToGallery) && (
                <>
                    <Text>
                        {messages.addedToGallery}
                    </Text>
                    <ProgressBarContainer>
                        <ProgressBar 
                            progress={1} 
                        />
                    </ProgressBarContainer>
                
                    <Button
                        mode="contained"
                        onPress={handleGoBackClick}
                    >
                        {messages.goBack}
                    </Button>
                </>
            )}

            {/*
            <View
                style={{
                    flex: 1,
                    flexGrow: 1,
                }}
            >
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={(log: string) => `${logs.indexOf(log)}`}
                    contentContainerStyle={{}}
                />
            </View>
            */}

            <StatusBar style="auto" />
        </ViewContainer>
    );
}

function replaceAll(str: string, find: string, replace: string): string {
    return str.split(find).join(replace);
}

const ViewContainer = styled.View`
    padding-top: ${Constants.statusBarHeight}px;
    height: 100%;
    background-color: #fff;
    align-items: center;
    justify-content: center;
`;

const ProgressBarContainer = styled.View`
    width: 300px;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 20px;
    margin-top: 5px;
`;

const LargeText = styled.Text`
    font-size: 16px;
    margin-bottom: 20px;
`;