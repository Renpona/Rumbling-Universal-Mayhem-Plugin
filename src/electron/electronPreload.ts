import { VtuberSettings } from "../types"

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // send data from main process to renderer
    onUpdateSettings: (callback) => ipcRenderer.on('settings', (_event, value) => callback(value)),
    
    // send data from renderer process to main
    vtuberConnect: (vtuberSettings: VtuberSettings) => ipcRenderer.send('vtuberConnect', vtuberSettings)
})

console.log("preload loaded");
