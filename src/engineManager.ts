import { ChildProcess, execFile } from 'node:child_process';
import EventEmitter from 'node:events';

const intifaceEvent = new EventEmitter();
const abortController = new AbortController();
const options = {
    signal: abortController.signal
}
const args = [
    '--server-name', 'RUMP', '--websocket-port', '12345', 
    '--use-device-websocket-server', '--use-bluetooth-le', 
    '--user-device-config-file', 'config/vts-device-config.json', 
    '--log', 'debug'];

function startIntifaceEngine() {
    let engine = execFile('intiface/intiface-engine.exe', args, options, (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
    });
    engine.stdout.on("data", detectIntifaceReady);
    return engine;
}

function detectIntifaceReady(data: string | Buffer) {
    // TODO: bring back intiface console logging of some kind once I've added a logging library, this is just way too verbose otherwise
    console.log(data);
    let message: string = data.toString();
    let regex = /:websocket_server_comm_manager.*Listening on:/;
    if (message.match(regex)) {
        console.log("Intiface started!");
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