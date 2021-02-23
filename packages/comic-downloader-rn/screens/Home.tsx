import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { Alert, Platform, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import MediaLibrary from 'expo-media-library'
import * as Permissions from 'expo-permissions'
import styled from 'styled-components/native'
import { Button, TextInput } from 'react-native-paper'
import { useSelector, useDispatch } from 'react-redux'
import { StoreState, chapterSlice } from 'comic-downloader-core'
import { RootStackParamList } from '.'
import locales from '../locales'
import { LocaleContext, localeContext } from '../locales/LocaleContext'

type HomeScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenRouteProp;
}

export default function Home({ navigation }: Props) {
    const dispatch = useDispatch();
    const state: StoreState = useSelector((state: StoreState) => state);
    const { locale } = useContext(localeContext) as LocaleContext;
    
    const messages = locales[locale];

    const handleDownloadChapterPress = async () => {
        // check if we have the media library permission if we're not on the web
        if (Platform.OS !== 'web') {
            const permission = await Permissions.getAsync(Permissions.MEDIA_LIBRARY);
            if (typeof permission === 'undefined' || !permission.granted) {
                const newPermision = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
                if (!newPermision.granted) {
                    return;
                }
            }
        }

        if (state.chapter.url.trim().length === 0) {
            Alert.alert(messages.forgotChapterUrl);
            return;
        }

        // regex that only allows for letters, numbers, space, underscore and slash
        const regex = /^([a-zA-Z0-9 _-]+)$/;
        if (state.chapter.chapterName.trim().length > 0 && 
            !regex.test(state.chapter.chapterName)) {
            Alert.alert(messages.invalidChapterName);
            return;
        }
        if (state.chapter.albumName.trim().length > 0 && 
            !regex.test(state.chapter.albumName)) {
            Alert.alert(messages.invalidAlbumName);
            return;
        }

        navigation.replace('DownloadInfo')
    };

    return (
        <HomeContainer>
            <TextInputContainer>
                <TextInput
                    label="Chapter URL"
                    value={state.chapter.url}
                    textAlign=""
                    onChangeText={text => {
                        dispatch(chapterSlice.actions.setUrl(text));
                    }}
                />
            </TextInputContainer>

            <TextInputContainer>
                <TextInput
                    label="Chapter name (optional)"
                    value={state.chapter.chapterName}
                    textAlign=""
                    onChangeText={text => {
                        dispatch(chapterSlice.actions.setName(text));
                    }}
                />
            </TextInputContainer>

            <TextInputContainer>
                <TextInput
                    label="Album name (optional)"
                    value={state.chapter.albumName}
                    textAlign=""
                    onChangeText={text => {
                        dispatch(chapterSlice.actions.setAlbumName(text));
                    }}
                />
            </TextInputContainer>

            <Button
                mode="contained"
                onPress={handleDownloadChapterPress}
            >
                Download chapter
            </Button>

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

const TextInputContainer = styled.View`
    width: 250px;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 20px;
`;

const SaveAtContainer = styled.View`
    margin-bottom: 20px;
    text-align: center;
    align-items: center;
`;