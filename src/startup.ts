const fs = require("node:fs");
import { connectIntiface } from "./intifaceConnector";
import { errorHalt, pluginName, resolveResource } from "./utils";
import { WebSocket } from "ws";
import { ApiClient } from "vtubestudio";
import { intifaceEvent, startIntifaceEngine } from "./engineManager";
import { ChildProcess } from "child_process";
import { ConnectionStatus, ExitCode, FormType, Protocol } from "./enums";
import { IntifaceSettings, Settings, VtuberSoftware } from "./types";
import { sendDefaultsToUi, updateStatus } from "./electron/electronMain";
import { ConnectorWarudo } from "./warudoConnector";
import { ConnectorVnyan } from "./vnyanConnector";
import { ConnectorVtubestudio } from "./vtsConnector";

var intifaceEngine: ChildProcess;
var intifaceConnection: WebSocket;
var vtsConnection: ApiClient;
var vtuberConnector: VtuberSoftware;

function loadConfig() {
    const fileName = "settings.json";
    let settings: string;
    try {
        settings = fs.readFileSync(resolveResource(`config/${fileName}`), "utf-8");
    } catch(e) {
        errorHalt(`Reading config file ${fileName} failed.`, ExitCode.ConfigReadFailed, e);
    }
    return JSON.parse(settings);
}

function parseSettings() {
    initIntiface();
    sendDefaultsToUi(settings);
}

const settings: Settings = loadConfig();
console.log(settings);

function initIntiface() {
    let intiface = settings.intiface;
    if (intiface["useLocal"]) {
        initIntifaceEngine(intiface);
    } else {
        intifaceConnection = connectIntiface(intiface.host, intiface.port);
    }
}

function initIntifaceEngine(intiface: IntifaceSettings) {
    intifaceEvent.once("ready", () => connectIntiface(intiface.host, intiface.port));
    console.log("Initializing Intiface Engine...");
    intifaceEngine = startIntifaceEngine();
}

function connectVtuber(protocol: Protocol, host: string, port: number) {
    switch (protocol) {
        case Protocol.VtubeStudio:
            vtuberConnector = new ConnectorVtubestudio();
            break;
        case Protocol.Vnyan:
            vtuberConnector = new ConnectorVnyan();
            break;
        case Protocol.Warudo:
            vtuberConnector = new ConnectorWarudo();
            break;
        default:
            console.error("Unexpected vtuber protocol: %s", protocol);
            updateStatus(FormType.Vtuber, ConnectionStatus.Error, `Invalid Vtuber software protocol ${protocol} selected.`);
            break;
    }
    vtuberConnector.connect(host, port);
}

function disconnectVtuber() {
    vtuberConnector.disconnect();
}

function sendVtuberParamData(param: string, value: number) {
    vtuberConnector.sendData(param, value);
}

function shutdown() {
    //TODO: close intiface engine if started
    intifaceConnection.close(0, `${pluginName} is shutting down.`);
    vtsConnection.disconnect();
    process.exit(0);
}

export { parseSettings, connectVtuber, disconnectVtuber, sendVtuberParamData }