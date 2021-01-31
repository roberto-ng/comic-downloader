import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { withRouter } from 'react-router-dom'
import { localeContext } from '../locales/localeContext'
import { chapterContext } from '../ChapterContext'
import locales from '../locales'

const { dialog, getCurrentWindow } = require('electron').remote;

export default withRouter(({ history }) => {
    const { locale } = useContext(localeContext);
    const { 
        url, 
        chapterName,
        outputDir, 
        changeUrl, 
        changeChapterName,
        changeOutputDir,
    } = useContext(chapterContext);

    const handleDownloadChapterClick = () => {        
        if (url.trim().length === 0) {
            window.alert(messages.forgotChapterUrl);
            return;
        }
        if (outputDir.trim().length === 0) {
            window.alert(messages.forgotToChooseFolder);
            return;
        }

        // regex that only allows for letters, numbers, space, underscore and slash
        const regex = /^([a-zA-Z0-9 _-]+)$/;
        if (chapterName.trim().length > 0 && 
            !regex.test(chapterName)) {
            window.alert(messages.invalidChapterName);
            return;
        }

        const encodedUrl = encodeURIComponent(url.trim());
        const encodedDir = encodeURIComponent(outputDir.trim());

        const route = `/downloadinfo/${encodedUrl}/${encodedDir}`;
        history.push(route);
    };

    const handleSelectFolderClick = async () => {
        const mainWindow = getCurrentWindow();

        let defaultPath: string|undefined = undefined;
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

        changeOutputDir(result.filePaths[0]);
    };

    const messages = locales[locale];
    return (
        <HomeContainer>
            <div>
                <TextField 
                    label={messages.chapterUrl} 
                    value={url}
                    variant="outlined" 
                    type="text"
                    fullWidth={true}
                    onChange={e => changeUrl(e.target.value)} 
                    style={textFieldStyle}
                />
                <br/>
                </div>

                <TextField 
                    label={messages.chapterName} 
                    value={chapterName}
                    variant="outlined" 
                    type="text"
                    fullWidth={true}
                    onChange={e => changeChapterName(e.target.value)} 
                    style={textFieldStyle}
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

const textFieldStyle = { 
    marginBottom: '20px', 
    width: '300px', 
};