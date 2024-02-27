import { ChildProcess, execFile } from 'node:child_process';
import EventEmitter from 'node:events';

const intifaceEvent = new EventEmitter();
const abortController = new AbortController();
const options = {
    signal: abortController.signal
}
const args = ['--websocket-port', '12345', '--use-device-websocket-server','--user-device-config-file', 'config/vts-device-config.json','--log','debug'];

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
    console.log(data);
    let message: string = data.toString();
    let regex = /:websocket_server_comm_manager.*Listening on:/;
    if (message.match(regex)) {
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