import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { HotkeyData, Settings, VtsAction, VtuberSettings } from '../types';
import path from 'node:path';
import { connectVtuber, disconnectVtuber, parseSettings, registerActions } from '../startup';
import { ConnectionStatus, FormType } from '../enums';
import { resolveProtocol } from '../utils';
import { getLogger } from '../loggerConfig';

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
    ipcMain.on('vtsActionSubmit', handleVtsActionSubmit);

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
    connectVtuber(resolveProtocol(vtuberSettings.protocol), vtuberSettings.host, vtuberSettings.port);
}

function handleVtuberDisconnect(_event: IpcMainEvent) {
    disconnectVtuber();
}

function handleVtsActionSubmit(_event: IpcMainEvent, action: VtsAction) {
    registerActions(action);
}

function updateStatus(category: FormType, state: ConnectionStatus, message: string) {
    getLogger().verbose("UpdateStatus target %s, state %s, message %s", category, state, message);
    mainWindow.webContents.send("status", category, state, message);
}

function updateHotkeyList(hotkeyList: HotkeyData[]) {
    mainWindow.webContents.send("hotkeyList", hotkeyList);
}

export { sendDefaultsToUi, updateStatus, updateHotkeyList };