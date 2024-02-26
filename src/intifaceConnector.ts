import WebSocket from 'ws';
import { pluginName } from './utils';
import { sendParamValue } from './vtsConnector';

//const ws = new WebSocket('ws://127.0.0.1:54817');

const DEVICE_ADDRESS = "V9T8S7";
const identifier = {
    "identifier": pluginName,
    "address": DEVICE_ADDRESS,
    "version": 0
};

function connectIntiface(host, port) {
    const ws = new WebSocket(`ws://${host}:${port}`);

    ws.on('error', console.error);

    ws.on('close', function close(code, reason) {
        console.error(reason);
        clearInterval(updateTimer);
        updateTimer = null;
    });

    ws.on('open', function open() {
        let handshake = JSON.stringify(identifier);
        console.log('\n\nsent: %s', handshake)
        ws.send(handshake);
    });

    ws.on('message', function message(data) {
        let result = data.toString();
        console.log('received: %s', result);
        
        let linearValue = linearParse(result);
        console.log('linear: %s', linearValue);
        state.linearValue = linearValue;
        
        let vibrateValue = vibrateParse(result);
        console.log('vibrate: %s', vibrateValue);
        state.vibrateValue = vibrateValue;

        update();

        if (!updateTimer) {
            updateTimer = setInterval(update, 600);
        };
    });

    return ws;
}

const linearRegex = /L\d+/i;
function linearParse(data: string) {
    let linearData = data.match(linearRegex);
    if (linearData != null) {
        let rawPosition: string = linearData[0].slice(2); //remove identifier and channel
        let position: number = Number(rawPosition)/100;
        return position;
    } else {
        return null;
    }
}

const vibrateRegex = /V\d+/i;
function vibrateParse(data: string) {
    let vibrateData = data.match(vibrateRegex);
    if (vibrateData != null) {
        let rawVibrate: string = vibrateData[0].slice(2); //remove identifier and channel
        let vibrate: number = Number(rawVibrate)/100;
        return vibrate;
    } else {
        return null;
    }
}

var updateTimer: NodeJS.Timeout;
var state = {
    linearValue: 0,
    vibrateValue: 0
};

// VTubeStudio needs param values to be resent every <1sec
function update() {
    if (state.linearValue != null) sendParamValue("Linear", state.linearValue);
    if (state.vibrateValue != null) sendParamValue("Vibrate", state.vibrateValue);
}

export { connectIntiface };