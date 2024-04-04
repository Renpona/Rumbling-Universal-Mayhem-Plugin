import { HotkeyType } from "vtubestudio";
import { Protocol } from "./enums";
import { openDB, DBSchema } from 'idb';

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

type ModelUpdateEvent = {
    modelLoaded: boolean,
    modelName: string,
    modelID: string
}

type HotkeyData = {
    name: string,
    type: string,
    hotkeyID: string
}

type VtsAction = {
    actionName?: string,
    actionType: "hotkeyTrigger",
    actionData: ActionHotkey,
    vibrateRange: {
        min: number,
        max: number
    },
    triggers: {
        enter: boolean,
        exit: boolean,
        while: boolean
    }
}

type VtsActionRecord = {
    actionSetName: string,
    modelId: string,
    actionList: VtsAction[]
}

type ActionHotkey = {
    hotkeyID: string
}

interface Database extends DBSchema {
    "savedActions": {
        key: string,
        value: VtsActionRecord,
        indexes: { modelId: string }
    }
}

export { Settings, VtuberSettings, ApplicationSettings, IntifaceSettings, VtuberSoftware, ModelUpdateEvent, HotkeyData, VtsAction, VtsActionRecord, ActionHotkey, Database }