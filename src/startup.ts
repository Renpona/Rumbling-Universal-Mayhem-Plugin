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
import { debugLogger, getLogger, initLogger } from "./loggerConfig";
import { Logger } from "winston";

var intifaceEngine: ChildProcess;
var intifaceConnection: WebSocket;
var vtsConnection: ApiClient;
var vtuberConnector: VtuberSoftware;

var logger: Logger;

function loadConfig() {
    let logger = getLogger();
    let settings: string;
    const fileName = "settings.json";
    const filePath = resolveResource(`config/${fileName}`);
    
    try {
        logger.debug("Reading settings from %s...", filePath);
        settings = fs.readFileSync(filePath, "utf-8");
    } catch(e) {
        logger.error(e);
        logger.error("Reading settings failed, exiting program...");
        errorHalt(`Reading config file ${fileName} failed.`, ExitCode.ConfigReadFailed, e);
    }

    logger.info("Settings read successful.");
    logger.debug(settings);
    return JSON.parse(settings);
}

function parseSettings() {
    logger = initLogger();
    if (settings.application && settings.application.debug) {
        debugLogger();
    }
    initIntiface();
    sendDefaultsToUi(settings);
}

const settings: Settings = loadConfig();

function initIntiface() {
    let intiface = settings.intiface;
    if (intiface["useLocal"]) {
        logger.info("Configured to use local Intiface Engine.");
        initIntifaceEngine(intiface);
    } else {
        logger.info("Configured to use Intiface Central.");
        intifaceConnection = connectIntiface(intiface.host, intiface.port);
    }
}

function initIntifaceEngine(intiface: IntifaceSettings) {
    intifaceEvent.once("ready", () => connectIntiface(intiface.host, intiface.port));
    logger.info("Initializing Intiface Engine...");
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
            logger.error("Unexpected vtuber protocol: %s", protocol);
            updateStatus(FormType.Vtuber, ConnectionStatus.Error, `Invalid Vtuber software protocol ${protocol} selected.`);
            break;
    }
    logger.info("Connecting to VTuber software %s.", protocol);
    logger.debug("Connection info: %s:%s", host, port);
    vtuberConnector.connect(host, port);
}

function disconnectVtuber() {
    if (vtuberConnector) {
        vtuberConnector.disconnect();
    } else {
        return;
    }
}

function sendVtuberParamData(param: string, value: number) {
    if (vtuberConnector) {
        vtuberConnector.sendData(param, value);
    } else {
        return;
    }
}

function shutdown() {
    //TODO: close intiface engine if started
    intifaceConnection.close(1000, `${pluginName} is shutting down.`);
    vtsConnection.disconnect();
    process.exit(0);
}

export { parseSettings, connectVtuber, disconnectVtuber, sendVtuberParamData }