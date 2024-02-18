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
    let result = data;
    console.log('received: %s', result);    
});