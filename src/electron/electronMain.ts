import { app, BrowserWindow, ipcMain } from 'electron';
import { Settings, VtuberSettings } from '../types';
import { connectVTubeStudio } from '../vtsConnector';
import path from 'node:path';
import { parseSettings } from '../startup';
import { ConnectionStatus, FormType } from '../enums';

var mainWindow: BrowserWindow; 

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 1024,
        webPreferences: {
            preload: path.join(__dirname, "/electronPreload.js")
        }
    });

    win.loadFile(path.join(__dirname, "/index.html"))
        .then(parseSettings);
    mainWindow = win;
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

function sendDefaultsToUi(settings: Settings) {
    mainWindow.webContents.send('settings', settings);
}

function handleVtuberConnect(event, vtuberSettings: VtuberSettings) {
    connectVTubeStudio(vtuberSettings.host, vtuberSettings.port);
}

function updateStatus(category: FormType, state: ConnectionStatus, message: string) {
    console.log("sending status to renderer");
    mainWindow.webContents.send("status", category, state, message);
}

export { sendDefaultsToUi, updateStatus };