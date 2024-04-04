import { VtsAction, VtuberSettings } from "../types"

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // send data from main process to renderer
    onUpdateSettings: (callback) => ipcRenderer.on('settings', (_event, value) => callback(value)),
    onUpdateStatus: (callback) => ipcRenderer.on('status', (_event, category, state, message) => callback(category, state, message)),
    onChangeModelVts: (callback) => ipcRenderer.on('modelChangeVts', (_event, modelEvent) => callback(modelEvent)),
    onUpdateHotkeyList: (callback) => ipcRenderer.on('hotkeyList', (_event, hotkeyList) => callback(hotkeyList)),
    
    // send data from renderer process to main
    vtuberConnect: (vtuberSettings: VtuberSettings) => ipcRenderer.send('vtuberConnect', vtuberSettings),
    vtuberDisconnect: () => ipcRenderer.send('vtuberDisconnect'),
    vtsActionSubmit: (actionList: VtsAction[]) => ipcRenderer.send('vtsActionSubmit', actionList)
})

console.log("Electron preload scripts loaded.");
