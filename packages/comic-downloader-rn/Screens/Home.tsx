import { StatusBar } from 'expo-status-bar'
import React, { useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import styled from 'styled-components/native'
import { Button, TextInput } from 'react-native-paper'
import { RootStackParamList } from '.'
import { chapterContext, ChapterContext } from '../ChapterContext'

type HomeScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenRouteProp;
}

export default function Home({ navigation }: Props) {
    const { 
        url, 
        chapterName,
        outputDir, 
        changeUrl, 
        changeChapterName,
        changeOutputDir,
    } = useContext(chapterContext) as ChapterContext;

    const handleDownloadChapterPress = () => {
        navigation.replace('DownloadInfo')
    };

    const handleChooseFolderPress = () => {
        console.log('hi!!!');
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

            <SaveAtContainer>
                <Text>Save at:</Text>
                <Button
                    mode="outlined"
                    onPress={handleChooseFolderPress}
                >
                    Select folder
                </Button>
            </SaveAtContainer>

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