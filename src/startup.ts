const fs = require("node:fs");
import { connectIntiface } from "./intifaceConnector";
import { connectVTubeStudio } from "./vtsConnector";
import { errorHalt, pluginName } from "./utils";
import { WebSocket } from "ws";
import { ApiClient } from "vtubestudio";
import { intifaceEvent, startIntifaceEngine } from "./engineManager";
import { ChildProcess } from "child_process";
import { ExitCode } from "./errorCodes";
import { IntifaceSettings, Settings } from "./types";
import { sendDefaultsToUi } from "./electron/electronMain";

var intifaceEngine: ChildProcess;
var intifaceConnection: WebSocket;
var vtsConnection: ApiClient;

function loadConfig() {
    const fileName = "settings.json";
    let settings: string;
    try {
        settings = fs.readFileSync(`./config/${fileName}`, "utf-8");
    } catch(e) {
        errorHalt(`Reading config file ${fileName} failed.`, ExitCode.ConfigReadFailed, e);
    }
    return JSON.parse(settings);
}

function parseSettings() {
    initIntiface();
    //initVtuber();
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

function initVtuber() {
    let vtuber = settings.vtuber;
    if (vtuber.protocol == "vtubestudio") {
        vtsConnection = connectVTubeStudio(vtuber.host, vtuber.port);
    } else {
        //TODO: other vtuber software
        errorHalt("Only VTubeStudio is currently supported", ExitCode.IncorrectConfigValue);
    }
}

function shutdown() {
    //TODO: close intiface engine if started
    intifaceConnection.close(0, `${pluginName} is shutting down.`);
    vtsConnection.disconnect();
    process.exit(0);
}

export { parseSettings }