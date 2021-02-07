import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import styled from 'styled-components/native'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import { Button } from 'react-native-paper'
import base64 from 'base64-js'
import { downloadComic, WebsiteIsNotSupported } from 'comic-downloader-core'
import { RootStackParamList } from '.'
import { useContext } from 'react'
import { chapterContext, ChapterContext } from '../ChapterContext'
import { localeContext, LocaleContext } from '../locales/LocaleContext'
import locales from '../locales'
import filenamify from 'filenamify/filenamify'

type DownloadInfoScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: DownloadInfoScreenRouteProp;
}

enum DOWNLOAD_STATE {
    DOWNLOADING,
    SUCCESS,
    ERROR,
}

//const url = 'https://tapas.io/episode/1886512';
const chaptersDir = FileSystem.cacheDirectory + 'chapters/';
//const targetDir = chaptersDir + filenamify(url) + '/';

export default function DownloadInfo({ navigation }: Props) {
    const { locale } = useContext(localeContext) as LocaleContext;
    const { 
        url,
        chapterName,
    } = useContext(chapterContext) as ChapterContext;

    const [targetDir, setTargetDir] = useState<string>(chaptersDir + filenamify(url) + '/');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [siteName, setSiteName] = useState<string>('');
    const [downloadStates, setDownloadStates] = useState<DOWNLOAD_STATE[]>([]);
    const [areAllDownloadsComplete, setAreAllDownloadsComplete] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [completeDownloadsNumber, setCompleteDownloadsNumber] = useState<number>(0);
    const [isWebsiteSupported, setIsWebsiteSupported] = useState<boolean>(true);
    const [isSavedToGallery, setIsSavedToGallery] = useState<boolean>(false);
    const [zipFile, setZipFile] = useState<string>('');
    const [uris, setUris] = useState<string[]>([]);

    useEffect(() => {
        startDownload().catch(e => console.error(e));
    }, []);

    useEffect(() => {
        // checks if all pages have been downloaded
        if (downloadStates.length === 0) {
            return;
        }
        
        let isFinished = true;
        for (const downloadState of downloadStates) {
            if (downloadState === DOWNLOAD_STATE.DOWNLOADING) {
                isFinished = false;
            }
        }

        setAreAllDownloadsComplete(isFinished);
    }, [downloadStates]);

    useEffect(() => {
        if (areAllDownloadsComplete && !isSavedToGallery) {
            moveFilesToGallery()
                .then(() => setIsSavedToGallery(true))
                .catch(e => console.error(e));
        }
    }, [areAllDownloadsComplete])

    const startDownload = async () => {
        const messages = locales[locale];
        setErrorMsg('');
        
        await ensureDirExists();
                
        try {
            let namePrefix = chapterName.trim().replace(' ', '_');
            if (namePrefix.length > 0) {
                namePrefix = `${namePrefix}-`
            }
            
            let pageUrl = url.trim();
            if (!pageUrl.startsWith('http')) {
                pageUrl = `http://${pageUrl}`;
            }
            
            const res = await downloadComic(pageUrl);
            setImageLinks(res.images);
            setIsWebsiteSupported(true);
            
            let localCompleteDownloads = 0; 
            const fileUris: string[] = new Array();
            const localLogs: string[] = new Array();
            const localDownloadStates: DOWNLOAD_STATE[] = new Array(res.images.length);
            for (let i = 0; i < localDownloadStates.length; i++) {
                localDownloadStates[i] = DOWNLOAD_STATE.DOWNLOADING;
            }
            
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
                        const index = res.images.indexOf(url);

                        const log = messages.pageDownloadedSuccessfully
                            .replace('{fileName}', fileName);
                        
                        localLogs.push(log);
                        setLogs([
                            ...localLogs,
                        ]);
                        
                        localDownloadStates[index] = DOWNLOAD_STATE.SUCCESS;
                        setDownloadStates([
                            ...localDownloadStates,
                        ]);

                        localCompleteDownloads += 1;
                        setCompleteDownloadsNumber(localCompleteDownloads);
                    })
                    .catch(([url, e]) => {
                        const index = res.images.indexOf(url);

                        console.warn(e);
        
                        localLogs.push(String(e));
                        setLogs([
                            ...localLogs,
                        ]);

                        localDownloadStates[index] = DOWNLOAD_STATE.ERROR;
                        setDownloadStates([
                            ...localDownloadStates,
                        ]);

                        localCompleteDownloads += 1;
                        setCompleteDownloadsNumber(localCompleteDownloads);
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
        const assets = await createAssets(uris);
        await addAssetsToAlbum('batata', assets);
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
        let assetList = assets;
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

    const progress = (100 * completeDownloadsNumber) / imageLinks.length;

    return (
        <HomeContainer>
            <Text>{completeDownloadsNumber}/{imageLinks.length}</Text>

            <Button
                mode="contained"
                onPress={handleGoBackClick}
            >
                Go back
            </Button>

            {(isSavedToGallery) && (
                <Text>
                    saved images to gallery
                </Text>
            )}

            <Button
                mode="outlined"
                onPress={() => console.log('testing')}
            >
                Test
            </Button>

            {(areAllDownloadsComplete) && (
                <Text>Download complete</Text>
            )}

            <StatusBar style="auto" />
        </HomeContainer>
    );
}

const HomeContainer = styled.View`
    flex: 1;
    background-color: #fff;
    align-items: center;
    justify-content: center;
`;