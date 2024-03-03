import { app, BrowserWindow, ipcMain } from 'electron';
import { Settings, VtuberSettings } from '../types';
import { connectVTubeStudio } from '../vtsConnector';
import path from 'node:path';
import { parseSettings } from '../startup';

var mainWindow: BrowserWindow; 


function sendDefaultsToUi(settings: Settings) {
    mainWindow.webContents.send('settings', settings);
}

function handleVtuberConnect(event, vtuberSettings: VtuberSettings) {
    connectVTubeStudio(vtuberSettings.host, vtuberSettings.port);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 1024,
        webPreferences: {
            preload: path.join(__dirname, "/electronPreload.js")
        }
    });

    win.loadFile(path.join(__dirname, "/index.html"));
    mainWindow = win;
    parseSettings();
}

app.whenReady().then(() => {
    createWindow();
    ipcMain.on('vtuberConnect', handleVtuberConnect);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

export { sendDefaultsToUi };