import { execFile } from 'node:child_process';
import EventEmitter from 'node:events';
import { resolveResource } from './utils';
import { getIntifaceLogger, getLogger } from './loggerConfig';

const intifaceEvent = new EventEmitter();
const abortController = new AbortController();
const options = {
    signal: abortController.signal
}
const args = [
    '--server-name', 'RUMP', '--websocket-port', '12345', 
    '--use-device-websocket-server', '--use-bluetooth-le', 
    '--user-device-config-file', resolveResource('config/vts-device-config.json'), 
    '--log', 'debug'];

function startIntifaceEngine() {
    let logger = getLogger();
    logger.debug("Executing %s with command-line args %s", resolveResource('intiface/intiface-engine.exe'), args);
    let engine = execFile(resolveResource('intiface/intiface-engine.exe'), args, options, (error, stdout, stderr) => {
        if (error) {
            logger.error(error);
            throw error;
        }
        getIntifaceLogger().info(stdout);
    });
    engine.stdout.on("data", detectIntifaceReady);
    return engine;
}

function detectIntifaceReady(data: string | Buffer) {
    getIntifaceLogger().info(data);
    let message: string = data.toString();
    let regex = /:websocket_server_comm_manager.*Listening on:/;
    if (message.match(regex)) {
        getLogger().info("Intiface Engine started!");
        intifaceEvent.emit("ready");
    } 
}

function stopIntifaceEngine(reason?: string) {
    if (reason) {
        abortController.abort(reason);
    } else {
        abortController.abort();
    }
}

export { intifaceEvent, startIntifaceEngine }