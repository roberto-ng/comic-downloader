import React, { useEffect, useMemo, useState } from 'react'
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import contextMenu from 'electron-context-menu'
import { createMuiTheme } from '@material-ui/core/styles'
import { purple } from '@material-ui/core/colors'
import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { store, chapterSlice, downloadComic } from 'comic-downloader-core'
import Home from '../routes/Home'
import DownloadInfo from '../routes/DownloadInfo'
import locales from '../locales'
import { localeContext, getValidLocale } from '../locales/localeContext'

const { app } = require('electron').remote;

const theme = createMuiTheme({
    palette: {
        primary: purple,
    },
});

function App() {
    const [locale, setLocale] = useState<string>('en');

    useEffect(() => {
        // get system locale
        const newLocale = getValidLocale(app.getLocale());
        setLocale(newLocale);
        
        const { 
            copy,
            cut,
            paste,
        } = locales[newLocale];
        
        contextMenu({
            showInspectElement: false,
            showSearchWithGoogle: false,
            labels: {
                cut,
                copy,
                paste,
            },
        });
    }, []);

    const changeLocale = (newLocale: string) => {
        setLocale(getValidLocale(newLocale));
    };

    const localeContextValue = useMemo(() => ({
        locale,
        changeLocale,
    }), [locale]);

    const messages = locales[locale];

    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <localeContext.Provider value={localeContextValue}> 
                    <Router>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route 
                                path="/downloadinfo/" 
                                component={DownloadInfo} 
                            />
                        </Switch>
                    </Router>
                </localeContext.Provider>
            </Provider>
        </ThemeProvider>
    );
}

export default hot(module)(App);