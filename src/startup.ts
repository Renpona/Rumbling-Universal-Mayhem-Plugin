const fs = require("node:fs");
import { connectIntiface } from "./intifaceConnector";
import { connectVTubeStudio } from "./vtsConnector";
import { errorHalt, pluginName } from "./utils";
import { WebSocket } from "ws";
import { ApiClient } from "vtubestudio";

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

type Settings = {
    "vtuber": Vtuber;
    "intiface": Intiface;
}
type Vtuber = {
    "protocol": string;
    "host": string;
    "port": number;
}
type Intiface = {
    "use-local": boolean;
    "host": string;
    "port": number;
    "vibration_multiplier": number;
}

function parseSettings() {
    initIntiface();
    initVtuber();
}

const settings: Settings = loadConfig();
console.log(settings);
parseSettings();

function initIntiface() {
    let intiface = settings.intiface;
    if (intiface["use-local"]) {
        //TODO: set up intiface engine before continuing
    }
    intifaceConnection = connectIntiface(intiface.host, intiface.port);
}

function initVtuber() {
    let vtuber = settings.vtuber;
    if (vtuber.protocol == "vtubestudio") {
        vtsConnection = connectVTubeStudio(vtuber.host, vtuber.port);
    } else {
        //TODO: other vtuber software
        errorHalt("Only VTubeStudio is currently supported", 3);
    }
}

function shutdown() {
    //TODO: close intiface engine if started
    intifaceConnection.close(0, `${pluginName} is shutting down.`);
    vtsConnection.disconnect();
    process.exit(0);
}