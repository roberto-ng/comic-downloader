import React, { useContext, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { withRouter } from 'react-router-dom'
import { localeContext } from '../locales/localeContext'
import { StoreState, chapterSlice } from 'comic-downloader-core'
import locales from '../locales'

const { dialog, getCurrentWindow } = require('electron').remote;

export default withRouter(({ history }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: StoreState) => state);  
    const { locale } = useContext(localeContext);

    const handleDownloadChapterClick = () => {        
        if (state.chapter.url.trim().length === 0) {
            window.alert(messages.forgotChapterUrl);
            return;
        }
        if (state.chapter.outputDir.trim().length === 0) {
            window.alert(messages.forgotToChooseFolder);
            return;
        }

        // regex that only allows for letters, numbers, space, underscore and slash
        const regex = /^([a-zA-Z0-9 _-]+)$/;
        if (state.chapter.chapterName.trim().length > 0 && 
            !regex.test(state.chapter.chapterName)) {
            window.alert(messages.invalidChapterName);
            return;
        }

        const encodedUrl = encodeURIComponent(state.chapter.url.trim());
        const encodedDir = encodeURIComponent(state.chapter.outputDir.trim());

        const route = `/downloadinfo/${encodedUrl}/${encodedDir}`;
        history.push(route);
    };

    const handleSelectFolderClick = async () => {
        const mainWindow = getCurrentWindow();

        let defaultPath: string|undefined = undefined;
        if (state.chapter.outputDir.trim().length > 0) {
            // set the last selected folder as the default path
            defaultPath = state.chapter.outputDir.trim();
        }

        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            defaultPath: defaultPath,
        });

        if (result.filePaths.length === 0) {
            return;
        }

        dispatch(chapterSlice.actions.setOuputDir(result.filePaths[0]));
    };

    const messages = locales[locale];
    return (
        <HomeContainer>
            <div>
                <TextField 
                    label={messages.chapterUrl} 
                    value={state.chapter.url}
                    variant="outlined" 
                    type="text"
                    fullWidth={true}
                    onChange={e => {
                        const url = e.target.value;
                        dispatch(chapterSlice.actions.setUrl(url));
                    }} 
                    style={textFieldStyle}
                />
                <br/>
                </div>

                <TextField 
                    label={messages.chapterName} 
                    value={state.chapter.chapterName}
                    variant="outlined" 
                    type="text"
                    fullWidth={true}
                    onChange={e => {
                        const name = e.target.value;
                        dispatch(chapterSlice.actions.setName(name));
                    }} 
                    style={textFieldStyle}
                />
                <br/>

            {(state.chapter.outputDir === '') ? (
                <label>{messages.saveInNoFolder}</label>
            ) : (
                <label>
                    {messages.saveIn.replace('{outputDir}', state.chapter.outputDir)}
                </label>
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