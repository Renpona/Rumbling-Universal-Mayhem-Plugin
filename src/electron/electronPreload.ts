import { VtuberSettings } from "../types"

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // send data from main process to renderer
    onUpdateSettings: (callback) => ipcRenderer.on('settings', (_event, value) => callback(value)),
    onUpdateStatus: (callback) => ipcRenderer.on('status', (_event, category, state, message) => callback(category, state, message)),
    
    // send data from renderer process to main
    vtuberConnect: (vtuberSettings: VtuberSettings) => ipcRenderer.send('vtuberConnect', vtuberSettings),
    vtuberDisconnect: () => ipcRenderer.send('vtuberDisconnect')
})

console.log("preload loaded");
