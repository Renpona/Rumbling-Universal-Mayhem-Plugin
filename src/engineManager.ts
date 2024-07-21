import { ChildProcess, execFile } from 'node:child_process';
import EventEmitter from 'node:events';
import { resolveResource } from './utils';
import { getIntifaceLogger, getLogger } from './loggerConfig';

const intifaceEvent = new EventEmitter();
const abortController = new AbortController();
const options = {
    signal: abortController.signal
}

function createArgs(clientPort: string) {
    const args = [
        '--server-name', 'RUMP', '--websocket-port', clientPort, 
        '--use-device-websocket-server', '--use-bluetooth-le', 
        '--user-device-config-file', resolveResource('config/vts-device-config.json'), 
        '--log', 'debug'
    ];
    return args;
}

function startIntifaceEngine(clientPort?: number) {
    let logger = getLogger();
    const port: string = clientPort ? clientPort.toString() : '12345';
    const args = createArgs(port);
    logger.debug("Executing %s with command-line args %s", resolveResource('intiface/intiface-engine.exe'), args);
    let engine = execFile(resolveResource('intiface/intiface-engine.exe'), args, options, (error, stdout, stderr) => {
        getIntifaceLogger().info(stdout);
    });
    engine.on("exit", () => {
        logger.info("Intiface Engine terminated successfully.");
    });
    engine.on("error", (error) => {
        logger.error("Intiface child process threw error: ");
        logger.error(error.message);
    })
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
    } else if (message.match(/ERROR/)) {
        intifaceEvent.emit("errorShutdown", message);
    }
}

/*function stopIntifaceEngine(reason?: string) {
    if (reason) {
        abortController.abort(reason);
    } else {
        abortController.abort();
    }
}*/

function stopIntifaceEngine(process: ChildProcess) {
    if (process) {
        return process.kill();
    } else {
        getLogger().warn("stopIntifaceEngine called while engine process doesn't exist");
        return null;
    }
}

function detectClientConnect() {
    return null;
}

function detectClientDisconnect() {
    // TODO: should probably put in SOME detection here, since even I've been thrown off by unexpected disconnects and I have the debug console
    return null;
}

export { intifaceEvent, startIntifaceEngine, stopIntifaceEngine }