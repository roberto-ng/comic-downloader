import 'react-native-url-polyfill/auto'
import React, { useState } from 'react'
import * as Localization from 'expo-localization'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Home, DownloadInfo } from './screens'
import locales from './locales'
import { localeContext } from './locales/LocaleContext'
import { useEffect } from 'react';
import { getValidLocale } from './locales/LocaleContext'
import { Provider } from 'react-redux'
import { store } from 'comic-downloader-core'

const Stack = createStackNavigator();

export default function App() {
    const [locale, setLocale] = useState<string>('en');

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

    return (
        <Provider store={store}>
            <localeContext.Provider value={localeContextValue}>
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
            </localeContext.Provider>
        </Provider>
    );
}
