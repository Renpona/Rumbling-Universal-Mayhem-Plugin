const fs = require("node:fs");
import { IntifaceInstance } from "./intifaceConnector";
import { errorHalt, resolveResource } from "./utils";
import { ApiClient } from "vtubestudio";
import { ChildProcess } from "child_process";
import { ConnectionStatus, ExitCode, FormType, Intiface, Protocol } from "./enums";
import { IntifaceSettings, Settings, VtuberSoftware } from "./types";
import { sendSettingsToUi, updateStatus } from "./electron/electronMain";
import { ConnectorWarudo } from "./warudoConnector";
import { ConnectorVnyan } from "./vnyanConnector";
import { ConnectorVtubestudio } from "./vtsConnector";
import { debugLogger, getLogger, initLogger } from "./loggerConfig";
import { Logger } from "winston";
import { ConnectorMtion } from "./mtionConnector";

var intifaceEngine: ChildProcess;
var intifaceConnection: IntifaceInstance;
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
    initIntiface(settings.intiface);
    sendSettingsToUi(settings);
}

const settings: Settings = loadConfig();

function initIntiface(intifaceSettings: IntifaceSettings) {
    let intifaceType: Intiface;
    if (intifaceSettings["useLocal"]) {
        logger.info("Configured to use local Intiface Engine.");
        intifaceType = Intiface.Engine;
    } else {
        logger.info("Configured to use Intiface Central.");
        intifaceType = Intiface.Central;
    }
    intifaceConnection = new IntifaceInstance(intifaceType);
    intifaceConnection.start(intifaceSettings.websocketConnection, intifaceSettings.clientConnection);
}

function disconnectIntiface() {
    intifaceConnection.disconnectIntiface();    
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
        case Protocol.Mtion:
            vtuberConnector = new ConnectorMtion();
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

function registerActions(actions) {
    if (vtuberConnector.software == Protocol.VtubeStudio) {
        vtuberConnector.registerActions(actions);
    }
}

export { parseSettings, initIntiface, disconnectIntiface, vtuberConnector, connectVtuber, disconnectVtuber, sendVtuberParamData, registerActions }