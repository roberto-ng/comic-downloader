import 'react-native-url-polyfill/auto'
import React, { useState } from 'react'
import * as Localization from 'expo-localization'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Home, DownloadInfo } from './screens'
import { chapterContext } from './ChapterContext'
import locales from './locales'
import { localeContext } from './locales/LocaleContext'
import { useEffect } from 'react';
import { getValidLocale } from './locales/LocaleContext'

const Stack = createStackNavigator();

export default function App() {
    const [locale, setLocale] = useState<string>('en');
    const [url, setUrl] = useState<string>('');
    const [chapterName, setChapterName] = useState<string>('');
    const [albumName, setAlbumName] = useState<string>('');

    useEffect(() => {
        const newLocale = getValidLocale(Localization.locale);
        setLocale(newLocale);
    }, []);

    const changeLocale = (newLocale: string) => {
        setLocale(getValidLocale(newLocale));
    };

    const localeContextValue = {
        locale,
        changeLocale,
    };

    const changeUrl = (newUrl: string) => {
        setUrl(newUrl);
    };

    const changeAlbumName = (name: string) => {
        setAlbumName(name);
    };

    const changeChapterName = (name: string) => {
        setChapterName(name);
    };

    const chapterContextValue = {
        url,
        chapterName,
        albumName,
        changeUrl,
        changeChapterName,
        changeAlbumName,
    };

    return (
        <localeContext.Provider value={localeContextValue}>
            <chapterContext.Provider value={chapterContextValue}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen 
                            name="Home" 
                            component={Home}
                            options={{
                                headerShown: false,
                            }} 
                        />
                        <Stack.Screen 
                            name="DownloadInfo" 
                            component={DownloadInfo}
                            options={{
                                headerShown: false,
                            }} 
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </chapterContext.Provider>
        </localeContext.Provider>
    );
}
