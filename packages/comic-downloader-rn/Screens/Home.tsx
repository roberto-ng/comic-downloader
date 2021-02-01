import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import styled from 'styled-components/native'
import { Button } from 'react-native-paper'
import { RootStackParamList } from '.'

type HomeScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenRouteProp;
}

export default function Home({ navigation }: Props) {
    const handleDownloadChapterClick = () => {
        navigation.replace('DownloadInfo')
    };

    return (
        <HomeContainer>
            <Text>Hello world!!</Text>

            <Button
                mode="contained"
                onPress={handleDownloadChapterClick}
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