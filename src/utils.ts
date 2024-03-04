import { app } from "electron";
import path from "path";

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

export { pluginName, errorHalt, resolveResource };