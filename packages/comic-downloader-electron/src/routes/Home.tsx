import React, { useContext, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { LocaleContext } from '../locales/localeContext'
import { downloadComic } from 'comic-downloader-core'
import locales from '../locales'

const { dialog, getCurrentWindow } = require('electron').remote;

export default withRouter(({ history }) => {
    const { locale } = useContext(LocaleContext);

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

            {(outputDir === '') ? (
                <label>{messages.saveInNoFolder}</label>
            ) : (
                <label>{messages.saveIn.replace('{outputDir}', outputDir)}</label>
            )}
            <button onClick={handleSelectFolderClick}>
                {messages.selectFolder}
            </button>
            <br/>

            <button onClick={handleDownloadChapterClick}>
                {messages.downloadChapter}
            </button>
        </>
    );
})

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // extends React's HTMLAttributes
      directory?: string;
      webkitdirectory?: string;
    }
}