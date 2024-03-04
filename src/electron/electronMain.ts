import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { Settings, VtuberSettings } from '../types';
import { connectVTubeStudio, disconnectVtubeStudio } from '../vtsConnector';
import path from 'node:path';
import { parseSettings } from '../startup';
import { ConnectionStatus, FormType } from '../enums';

var mainWindow: BrowserWindow; 

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 610,
        webPreferences: {
            preload: path.join(__dirname, "/electronPreload.js")
        }
    });
    if (app.isPackaged) win.removeMenu();

    win.loadFile(path.join(__dirname, "/index.html"))
        .then(parseSettings);
    mainWindow = win;
}

app.whenReady().then(() => {
    createWindow();
    ipcMain.on('vtuberConnect', handleVtuberConnect);
    ipcMain.on('vtuberDisconnect', handleVtuberDisconnect);

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

function handleVtuberConnect(_event: IpcMainEvent, vtuberSettings: VtuberSettings) {
    connectVTubeStudio(vtuberSettings.host, vtuberSettings.port);
}

function handleVtuberDisconnect(_event: IpcMainEvent) {
    disconnectVtubeStudio();
}

function updateStatus(category: FormType, state: ConnectionStatus, message: string) {
    console.log("UpdateStatus target %s, state %s, message %s", category, state, message);
    mainWindow.webContents.send("status", category, state, message);
}

export { sendDefaultsToUi, updateStatus };