import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { withRouter } from 'react-router-dom'
import { LocaleContext } from '../locales/localeContext'
import locales from '../locales'

const { dialog, getCurrentWindow } = require('electron').remote;

export default withRouter(({ history }) => {
    const { locale } = useContext(LocaleContext);

    const [url, setUrl] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');

    const handleDownloadChapterClick = () => {
        if (url.trim().length === 0) {
            window.alert('You forgot to enter the chapter URL.');
            return;
        }
        if (outputDir.trim().length === 0) {
            window.alert('You forgot to choose a folder');
            return;
        }

        const encodedUrl = encodeURIComponent(url.trim());
        const encodedDir = encodeURIComponent(outputDir.trim());

        history.push(`/downloadinfo/${encodedUrl}/${encodedDir}`);
    };

    const handleSelectFolderClick = async () => {
        const mainWindow = getCurrentWindow();

        let defaultPath = undefined;
        if (outputDir.trim().length > 0) {
            // set the last selected folder as the default path
            defaultPath = outputDir.trim();
        }

        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            defaultPath: defaultPath,
        });

        if (result.filePaths.length === 0) {
            return;
        }

        setOutputDir(result.filePaths[0]);
    };

    const messages = locales[locale];
    return (
        <HomeContainer>
            <TextField 
                label={messages.chapterUrl} 
                variant="outlined" 
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)} 
                style={{ marginBottom: '20px' }}
            />
            <br/>

            {(outputDir === '') ? (
                <label>{messages.saveInNoFolder}</label>
            ) : (
                <label>{messages.saveIn.replace('{outputDir}', outputDir)}</label>
            )}
            <br/>
            <Button 
                variant="outlined"
                color="primary"
                onClick={handleSelectFolderClick}
            >
                {messages.selectFolder}
            </Button>
            <br/>

            <Button 
                variant="contained"
                color="primary"
                onClick={handleDownloadChapterClick}
                style={{ marginTop: '20px' }}
            >
                {messages.downloadChapter}
            </Button>
        </HomeContainer>
    );
});

const HomeContainer = styled.div`
    margin-top: 40px;
    text-align: center;
`;

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // extends React's HTMLAttributes
      directory?: string;
      webkitdirectory?: string;
    }
}