import { app } from "electron";
import path from "path";
import { Protocol } from "./enums";

const pluginName = "Rumbling Universal Mayhem Plugin";

function errorHalt(message: string, exitCode = 1, error?: Error) {
    console.error(message);
    if (error) console.error(error);
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
        default:
            console.error("Called resolveProtocol on unknown protocol: %s", protocol);
            break;
    }
    return result;
}

export { pluginName, errorHalt, resolveResource, resolveProtocol };