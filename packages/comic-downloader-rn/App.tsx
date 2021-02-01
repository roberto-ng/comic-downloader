import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { Button } from 'react-native-paper';

type RootStackParamList = {
    Home: undefined;
    DownloadInfo: undefined;
};

type HomeScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;
type DownloadInfoScreenRouteProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenRouteProp;
}

interface DownloadInfoProps {
    navigation: DownloadInfoScreenRouteProp;
}

function Home({ navigation }: Props) {
    const handleDownloadChapterClick = () => {
        navigation.replace('DownloadInfo')
    };

    return (
        <View style={styles.container}>
            <Text>Hello world!!</Text>

            <Button
                mode="contained"
                onPress={handleDownloadChapterClick}
            >
                Download chapter
            </Button>

            <StatusBar style="auto" />
        </View>
    );
}

function DownloadInfo({ navigation }: DownloadInfoProps) {
    const handleGoBackClick = () => {
        navigation.replace('Home')
    };

    return (
        <View style={styles.container}>
            <Button
                mode="contained"
                onPress={handleGoBackClick}
            >
                Go back
            </Button>

            <StatusBar style="auto" />
        </View>
    );
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="DownloadInfo" component={DownloadInfo} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
