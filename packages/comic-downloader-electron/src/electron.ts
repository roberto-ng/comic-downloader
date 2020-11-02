import * as electron from 'electron'

const app = electron.app;

import path from 'path';
import isDev from 'electron-is-dev';

let mainWindow: electron.BrowserWindow;

function createWindow() {
    mainWindow = new electron.BrowserWindow({
        width: 900,
        height: 680,
        webPreferences:{
            nodeIntegration:true
        }
    });

    mainWindow.loadURL(
        isDev ? 
        "http://localhost:8080/" :
        `file://${path.join(__dirname, 'index.html')}`
    );
    mainWindow.on('closed', (): any => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});