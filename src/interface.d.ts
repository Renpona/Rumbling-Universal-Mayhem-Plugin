import { VtuberSettings } from "./types"

export interface IElectronAPI {
    onUpdateSettings: (data: Function) => void,
    onUpdateStatus: (data: Function) => void,
    
    vtuberConnect: (settings: VtuberSettings) => void,
    vtuberDisconnect: () => void
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}