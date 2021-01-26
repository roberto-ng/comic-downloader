import React, { useEffect, useMemo, useState } from 'react'
import { hot } from 'react-hot-loader'
import { downloadComic } from 'comic-downloader-core'
import { 
    LocaleContext,
    getValidLocale,
} from '../locales/localeContext'
import locales from '../locales'

const { app } = require('electron').remote;

function App() {
    const [locale, setLocale] = useState<string>('en');
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [text, setText] = useState<string>('Downloading...');

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
        console.log(typeof app)
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

    const currentLocale = locales[locale];

    return (
        <LocaleContext.Provider value={value}>
            <p>Testing!!!</p>
            <button>
                {currentLocale.downloadChapter}
            </button>
        </LocaleContext.Provider>
    );
}

export default hot(module)(App);