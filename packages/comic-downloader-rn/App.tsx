import 'react-native-url-polyfill/auto';
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { Home, DownloadInfo } from './Screens'

const Stack = createStackNavigator();

export default function App() {
    return (
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
    );
}
