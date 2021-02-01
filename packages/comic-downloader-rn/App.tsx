import 'react-native-url-polyfill/auto';
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { Home, DownloadInfo } from './Screens'
import { chapterContext } from './ChapterContext'

const Stack = createStackNavigator();

export default function App() {
    const [url, setUrl] = useState<string>('');
    const [chapterName, setChapterName] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');

    const changeUrl = (newUrl: string) => {
        setUrl(newUrl);
    };

    const changeOutputDir = (dir: string) => {
        setOutputDir(dir);
    };

    const changeChapterName = (name: string) => {
        setChapterName(name);
    };

    const chapterContextValue = {
        url,
        chapterName,
        outputDir,
        changeUrl,
        changeChapterName,
        changeOutputDir,
    };

    return (
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
    );
}
