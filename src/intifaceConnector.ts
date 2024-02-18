import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:54817');

const DEVICE_ADDRESS = "V9T8S7";
const identifier = { 
    "identifier": "VTubeStudio Cursed",
    "address": DEVICE_ADDRESS,
    "version": 0
};

ws.on('error', console.error);

ws.on('close', function close(code, reason) {
    console.error(reason);
});

ws.on('open', function open() {
    let handshake = JSON.stringify(identifier);
    console.log('sent: %s', handshake)
    ws.send(handshake);
});

ws.on('message', function message(data) {
    let result = data.toString();
    console.log('received: %s', result);
    console.log('parsed: %s', tcodeParse(result));
});

const linearRegex = /L\d+/i;
function tcodeParse(data: string) {
    let linearData = data.match(linearRegex);
    let position: string = linearData[0].slice(2);
    return position;
}