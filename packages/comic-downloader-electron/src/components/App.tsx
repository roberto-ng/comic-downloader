import React, { useEffect, useMemo, useState } from 'react'
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import { 
    LocaleContext,
    getValidLocale,
} from '../locales/localeContext'
import locales from '../locales'
import Home from '../routes/Home'
import DownloadInfo from '../routes/DownloadInfo'

const { app } = require('electron').remote;

function App() {
    const [locale, setLocale] = useState<string>('en');

    useEffect(() => {
        // get system locale
        const newLocale = app.getLocale();
        setLocale(getValidLocale(newLocale));
    }, []);

    const changeLocale = (newLocale: string) => {
        setLocale(getValidLocale(newLocale));
    };

    const value = useMemo(() => ({
        locale,
        changeLocale,
    }), [locale]);

    const messages = locales[locale];

    return (
        <LocaleContext.Provider value={value}>
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route 
                        path="/downloadinfo/:encodedUrl/:encodedOutputDir" 
                        component={DownloadInfo} 
                    />
                </Switch>
            </Router>
        </LocaleContext.Provider>
    );
}

export default hot(module)(App);