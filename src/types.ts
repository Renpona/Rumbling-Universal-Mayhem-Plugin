import { HotkeyType } from "vtubestudio";
import { IntifaceChannelType, Protocol } from "./enums";
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
    useLocal: boolean;
    connectionInfo?: ConnectionInfo;
    vibration_multiplier?: number;
}
type ConnectionInfo = {
    host: string;
    port: number;
}

interface VtuberSoftware {
    software: Protocol,
    isConnected: boolean,
    connect: (host: string, port: number) => void,
    disconnect: () => void,
    sendData: (param: string, value: number) => void,
    registerActions: (action: Action[]) => void
}

type ModelUpdateEvent = {
    modelLoaded: boolean,
    modelName: string,
    modelID: string
}

type HotkeyData = {
    name: string,
    type: string,
    file: string,
    hotkeyID: string
}

interface Action {
    actionName?: string,
    actionType?: string,
    actionData: any;
    actionRange: {
        min: number,
        max: number
    },
    triggers: {
        enter: boolean,
        exit: boolean,
        while: boolean
    },
    channels: number[],
    channelType: IntifaceChannelType
}

interface VtsAction extends Action {
    actionName?: string,
    actionType: "hotkeyTrigger",
    actionData: ActionHotkey,
}

interface MtionAction extends Action {
    actionName?: string,
    actionData: {
        triggerId: string,
        param: MtionParamData,
    }
}

interface MtionParamData<Type = string> {
    "parameter_index": number,
    "value": Type
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

export { Settings, VtuberSettings, ApplicationSettings, IntifaceSettings, ConnectionInfo, VtuberSoftware, ModelUpdateEvent, HotkeyData, Action, VtsAction, MtionAction, MtionParamData, VtsActionRecord, ActionHotkey, Database }