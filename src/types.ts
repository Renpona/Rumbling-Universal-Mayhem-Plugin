import { HotkeyType } from "vtubestudio";
import { Protocol } from "./enums";

type Settings = {
    application: ApplicationSettings,
    vtuber: VtuberSettings;
    intiface: IntifaceSettings;
}
type ApplicationSettings = {
    debug: boolean
}
type VtuberSettings = {
    protocol: string;
    host: string;
    port: number;
}
type IntifaceSettings = {
    useLocal?: boolean;
    host: string;
    port: number;
    vibration_multiplier?: number;
}

interface VtuberSoftware {
    software: Protocol,
    isConnected: boolean,
    connect: (host: string, port: number) => void,
    disconnect: () => void,
    sendData: (param: string, value: number) => void,
    registerActions: (action: VtsAction | any) => void
}

type HotkeyData = {
    name: string,
    type: string,
    hotkeyID: string
}

type VtsAction = {
    actionType: "hotkeyTrigger",
    actionData: ActionHotkey,
    vibrateRange: {
        min: number,
        max: number
    }
}

type ActionHotkey = {
    hotkeyID: string
}

export { Settings, VtuberSettings, ApplicationSettings, IntifaceSettings, VtuberSoftware, HotkeyData, VtsAction, ActionHotkey }