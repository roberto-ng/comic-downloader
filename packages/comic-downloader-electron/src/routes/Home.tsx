import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { LocaleContext } from '../locales/localeContext'
import { downloadComic } from 'comic-downloader-core'
import locales from '../locales'

const { dialog, getCurrentWindow } = require('electron').remote;

export default withRouter(({ history }) => {
    const [url, setUrl] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');

    const handleDownloadChapterClick = () => {
        const encodedUrl = encodeURIComponent(url);
        const encodedDir = encodeURIComponent(outputDir);

        history.push(`/downloadinfo/${encodedUrl}/${encodedDir}`);
    };

    const handleSelectFolderClick = async () => {
        const mainWindow = getCurrentWindow();
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });

        if (result.filePaths.length === 0) {
            return;
        }

        setOutputDir(result.filePaths[0]);
    };

    const outputDirText = () => {
        if (outputDir === '') {
            return <label>Save at: no folder selected </label>
        }
        else {
            return <label>Save at: {outputDir} </label>
        }
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

                        {outputDirText()}
                        <button onClick={handleSelectFolderClick}>
                            Select folder
                        </button>
                        <br/>

                        <button onClick={handleDownloadChapterClick}>
                            {messages.downloadChapter}
                        </button>

                        {/*
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

                        */}
                    </>
                );
            }}
        </LocaleContext.Consumer>
    );
})

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // extends React's HTMLAttributes
      directory?: string;
      webkitdirectory?: string;
    }
}