import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { Alert, Text, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import MediaLibrary from 'expo-media-library'
import * as Permissions from 'expo-permissions'
import styled from 'styled-components/native'
import { Button, TextInput } from 'react-native-paper'
import { RootStackParamList } from '.'
import { chapterContext, ChapterContext } from '../ChapterContext'
import locales from '../locales'
import { LocaleContext, localeContext } from '../locales/LocaleContext'

type HomeScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenRouteProp;
}

export default function Home({ navigation }: Props) {
    const { locale } = useContext(localeContext) as LocaleContext;
    const { 
        url, 
        chapterName,
        changeUrl, 
        changeChapterName,
    } = useContext(chapterContext) as ChapterContext;

    const messages = locales[locale];

    const handleDownloadChapterPress = async () => {
        if (url.trim().length === 0) {
            Alert.alert(messages.forgotChapterUrl);
            return;
        }

        const permission = await Permissions.getAsync(Permissions.MEDIA_LIBRARY);
        if (typeof permission === 'undefined' || !permission.granted) {
            const newPermision = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if (!newPermision.granted) {
                return;
            }
        }

        // regex that only allows for letters, numbers, space, underscore and slash
        const regex = /^([a-zA-Z0-9 _-]+)$/;
        if (chapterName.trim().length > 0 && 
            !regex.test(chapterName)) {
            Alert.alert(messages.invalidChapterName);
            return;
        }

        navigation.replace('DownloadInfo')
    };

    return (
        <HomeContainer>
            <TextInputContainer>
                <TextInput
                    label="Chapter URL"
                    value={url}
                    onChangeText={text => changeUrl(text)}
                />
            </TextInputContainer>

            <TextInputContainer>
                <TextInput
                    label="Chapter name (optional)"
                    value={chapterName}
                    onChangeText={text => changeChapterName(text)}
                />
            </TextInputContainer>

            <Button
                mode="contained"
                onPress={handleDownloadChapterPress}
            >
                Download chapter
            </Button>

            <Text>{url}</Text>

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