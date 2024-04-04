import { VtsAction, VtuberSettings } from "./types"

export interface IElectronAPI {
    onUpdateSettings: (data: Function) => void,
    onUpdateStatus: (data: Function) => void,
    onChangeModelVts: (data: Function) => void,
    onUpdateHotkeyList: (data: Function) => void,
    
    vtuberConnect: (settings: VtuberSettings) => void,
    vtuberDisconnect: () => void,
    vtsActionSubmit: (actionList: VtsAction[]) => void
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}