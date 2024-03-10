import WebSocket from 'ws';
import { errorHalt, pluginName } from './utils';
import { ConnectionStatus, ExitCode, FormType } from './enums';
import { updateStatus } from './electron/electronMain';
import { sendVtuberParamData } from './startup';
import { getLogger } from './loggerConfig';

//const ws = new WebSocket('ws://127.0.0.1:54817');

const DEVICE_ADDRESS = "V9T8S7";
const identifier = {
    "identifier": pluginName,
    "address": DEVICE_ADDRESS,
    "version": 0
};

function connectIntiface(host: string, port: number) {
    let logger = getLogger();
    logger.info("Trying to connect to Intiface...");
    const ws = new WebSocket(`ws://${host}:${port}`);

    ws.on('error', logger.error);

    ws.on('close', function close(code, reason) {
        logger.error("Disconnected from Intiface Engine for reason: %s", reason.toString());
        // TODO: remove this once the ability to reconnect has been added
        errorHalt("Intiface connection lost", ExitCode.Standard);
    });

    ws.on('open', function open() {
        let handshake = JSON.stringify(identifier);
        logger.info("Connected to Intiface Engine!");
        logger.debug('sent: %s', handshake);
        updateStatus(FormType.Intiface, ConnectionStatus.Connected, "Intiface connected!");
        ws.send(handshake);
    });

    ws.on('message', function message(data) {
        let result = data.toString().trim();
        logger.verbose('Received TCode data: %s', result);
        
        let linearValue = linearParse(result);
        if (linearValue != null) logger.verbose('Linear: %s', linearValue);
        state.linearValue = linearValue;
        
        let vibrateValue = vibrateParse(result);
        if (vibrateValue != null) logger.verbose('Vibrate: %s', vibrateValue);
        state.vibrateValue = vibrateValue;

        update();
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

function update() {
    if (state.linearValue != null) sendVtuberParamData("Linear", state.linearValue);
    if (state.vibrateValue != null) sendVtuberParamData("Vibrate", state.vibrateValue);
}

export { connectIntiface };