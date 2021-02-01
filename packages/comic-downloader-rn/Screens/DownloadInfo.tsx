import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import styled from 'styled-components/native'
import { Button } from 'react-native-paper'
import { downloadComic, WebsiteIsNotSupported } from 'comic-downloader-core'
import { RootStackParamList } from '.'

type DownloadInfoScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: DownloadInfoScreenRouteProp;
}


export default function DownloadInfo({ navigation }: Props) {
    const [pages, setPages] = useState<string[]>([]);

    useEffect(() => {
        startDownload().catch(e => console.error(e));
    }, []);

    const startDownload = async () => {
        const pageUrl = 'https://tapas.io/episode/1886512';
        const res = await downloadComic(pageUrl);
        setPages(res.images);
    };
    
    const handleGoBackClick = () => {
        navigation.replace('Home')
    };

    return (
        <HomeContainer>
            <Button
                mode="contained"
                onPress={handleGoBackClick}
            >
                Go back
            </Button>

            {pages.map((page, i) => (
                <Text key={i}>{page}</Text>
            ))}

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