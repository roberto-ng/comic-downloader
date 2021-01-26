import React, { useState } from 'react'
import { LocaleContext } from '../locales/localeContext'
import { downloadComic } from 'comic-downloader-core'
import locales from '../locales'

export default function Home() {
    const [url, setUrl] = useState<string>('');
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleDownloadChapterClick = () => {
        // clear the error message
        setErrorMsg('');

        downloadComic(url)
            .then(res => {
                setSiteName(res.websiteData.name);
                setImageLinks(res.images);
            })
            .catch(() => setErrorMsg('Error'));
    };

    return (
        <LocaleContext.Consumer>
            {({ locale }) => {
                const messages = locales[locale];

                return (
                    <>
                        <label>{messages.chapterUrl}</label>
                        <input 
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)} 
                        />
                        <br/>

                        <button onClick={handleDownloadChapterClick}>
                            {messages.downloadChapter}
                        </button>

                        {(errorMsg.trim().length > 0) && (
                            <h2>{errorMsg}</h2>
                        )}

                        {(imageLinks.length > 0) && (
                            <>
                                <p>{siteName}</p>

                                {imageLinks.map(imageLink => (
                                    <p>{imageLink}</p>
                                ))}
                            </>
                        )}
                    </>
                )
            }}
        </LocaleContext.Consumer>
    );
}