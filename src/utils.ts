import { app, shell } from "electron";
import path from "path";
import { Protocol } from "./enums";
import { getLogger } from "./loggerConfig";

const pluginName = "Rumbling Universal Mayhem Plugin";

function errorHalt(message: string, exitCode = 1, error?: Error) {
    let logger = getLogger();
    logger.error(message);
    if (error) logger.error(error);
    process.exit(exitCode);
}

function resolveResource(target: string) {
    if (app.isPackaged) {
        return path.resolve(process.resourcesPath, target);
    } else {
        return path.resolve(__dirname, target);
    }
}

function resolveProtocol(protocol: string): Protocol {
    let result: Protocol;
    let logger = getLogger();
    switch (protocol.toLowerCase()) {
        case "vtubestudio":
            result = Protocol.VtubeStudio;
            break;
        case "vnyan":
            result = Protocol.Vnyan;
            break;
        case "warudo":
            result = Protocol.Warudo;
            break;
        case "mtion":
            result = Protocol.Mtion;
            break;
        default:
            logger.error("Called resolveProtocol on unknown protocol: %s", protocol);
            break;
    }
    return result;
}

function openExternalLink(url: string) {

}

export { pluginName, errorHalt, resolveResource, resolveProtocol };