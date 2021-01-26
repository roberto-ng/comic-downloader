import React, { useEffect, useMemo, useState } from 'react'
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import { 
    LocaleContext,
    getValidLocale,
} from '../locales/localeContext'
import locales from '../locales'
import Home from '../routes/Home'

const { app } = require('electron').remote;

function App() {
    const [locale, setLocale] = useState<string>('en');

    /*
    useEffect(() => {
        const url = 'https://tapas.io/episode/1123711';
        downloadComic(url)
            .then(res => {
                const name = res.websiteData.name;
                const pageNumber = res.images.length;
                setSiteName(name);
                setImageLinks(res.images);
                setText(`${name}\nNumber of pages: ${pageNumber}`);
            })
            .catch(() => setText('Error'));
    }, []);
    */

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
                </Switch>
            </Router>
        </LocaleContext.Provider>
    );
}

export default hot(module)(App);