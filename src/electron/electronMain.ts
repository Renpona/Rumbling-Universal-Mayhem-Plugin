import { app, BrowserWindow, ipcMain, IpcMainEvent, shell } from 'electron';
import { HotkeyData, ModelUpdateEvent, Settings, VtsAction, VtuberSettings } from '../types';
import path from 'node:path';
import { connectVtuber, disconnectIntiface, disconnectVtuber, initIntiface, parseSettings, registerActions, settings } from '../startup';
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
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    win.loadFile(path.join(__dirname, "/index.html"))
        .then(parseSettings);
    mainWindow = win;
}

app.whenReady().then(() => {
    createWindow();
    ipcMain.on('intifaceEngineConnect', handleIntifaceEngineConnect);
    ipcMain.on('intifaceCentralConnect', handleIntifaceCentralConnect);
    ipcMain.on('intifaceDisconnect', handleIntifaceDisconnect);
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

function sendSettingsToUi(settings: Settings) {
    mainWindow.webContents.send('settings', settings);
}

function handleIntifaceEngineConnect(event: IpcMainEvent): void {
    let params = settings?.intiface;
    params.useLocal = true;
    initIntiface(params);
}

function handleIntifaceCentralConnect(event: IpcMainEvent, host: string, port: number): void {
    initIntiface({ 
        useLocal: false, 
        websocketConnection: {
            host: host, 
            port: port 
        }
    });
}

function handleIntifaceDisconnect(event: IpcMainEvent): void {
    disconnectIntiface();
}

function handleVtuberConnect(_event: IpcMainEvent, vtuberSettings: VtuberSettings) {
    connectVtuber(resolveProtocol(vtuberSettings.protocol), vtuberSettings.host, vtuberSettings.port);
}

function handleVtuberDisconnect(_event: IpcMainEvent) {
    disconnectVtuber();
}

function handleVtsActionSubmit(_event: IpcMainEvent, actionList: VtsAction[]) {
    registerActions(actionList);
}

function updateStatus(category: FormType, state: ConnectionStatus, message: string) {
    getLogger().verbose("UpdateStatus target %s, state %s, message %s", category, state, message);
    mainWindow.webContents.send("status", category, state, message);
}

function changeModelVts(modelEvent: ModelUpdateEvent) {
    mainWindow.webContents.send("modelChangeVts", modelEvent);
}

function updateHotkeyList(hotkeyList: HotkeyData[]) {
    mainWindow.webContents.send("hotkeyList", hotkeyList);
}

export { sendSettingsToUi, updateStatus, changeModelVts, updateHotkeyList };