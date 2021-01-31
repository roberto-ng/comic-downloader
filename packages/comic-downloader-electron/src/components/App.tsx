import React, { useEffect, useMemo, useState } from 'react'
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import contextMenu from 'electron-context-menu'
import { createMuiTheme } from '@material-ui/core/styles'
import { purple } from '@material-ui/core/colors'
import { 
    localeContext,
    getValidLocale,
} from '../locales/localeContext'
import { chapterContext } from '../ChapterContext'
import locales from '../locales'
import Home from '../routes/Home'
import DownloadInfo from '../routes/DownloadInfo'
import { ThemeProvider } from 'styled-components'

const { app } = require('electron').remote;

const theme = createMuiTheme({
    palette: {
        primary: purple,
    },
});

function App() {
    const [locale, setLocale] = useState<string>('en');
    const [url, setUrl] = useState<string>('');
    const [chapterName, setChapterName] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');

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

    const messages = locales[locale];

    return (
        <ThemeProvider theme={theme}>
            <localeContext.Provider value={localeContextValue}>
                <chapterContext.Provider value={chapterContextValue}>
                    <Router>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route 
                                path="/downloadinfo/" 
                                component={DownloadInfo} 
                            />
                        </Switch>
                    </Router>
                </chapterContext.Provider>
            </localeContext.Provider>
        </ThemeProvider>
    );
}

export default hot(module)(App);