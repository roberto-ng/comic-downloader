import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader';
import { downloadComic } from 'comic-downloader-core';

function App() {
    const [text, setText] = useState<string>('Downloading...');

    useEffect(() => {
        const url = 'https://tapas.io/episode/1123711';
        downloadComic(url)
            .then(res => {
                const name = res.websiteData.name;
                const pageNumber = res.images.length;
                setText(`${name}\nNumber of pages: ${pageNumber}`);
            })
            .catch(() => setText('Error'));
    }, []);

    return (
        <>
            <p>Testing!!!</p>
            <p>{text}</p>
        </>
    );
}

export default hot(module)(App);