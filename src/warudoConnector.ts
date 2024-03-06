import { WebSocket } from "ws";
import { VtuberSoftware } from "./types";
import { Protocol } from "./enums";

/*

ws://localhost:19190
{ "action": "test", "data": 100 }

*/

class ConnectorWarudo implements VtuberSoftware {
    software: Protocol = Protocol.Warudo;
    ws: WebSocket;
    isConnected: boolean = false;

    public connect(host: string, port: number) {
        this.ws = new WebSocket(`ws://${host}:${port}`);
        this.setWebsocketListeners();
    }

    public disconnect() {
        this.ws.close(0, "Disconnect method called");
    }

    public sendData(param: string, value: number) {
        let packet = JSON.stringify(this.buildPacket(param, value));
        this.ws.send(packet);
    }

    protected setWebsocketListeners() {
        let name = this.software;
        this.ws.on("open", function open() {
            console.log(`Connected to ${name}`);
        });

        this.ws.on("close", function close(code, reason) {
            console.log(`Disconnected from ${name} for reason ${reason}`);
        });

        this.ws.on("error", function error(error) {
            console.error(`Connection to ${name} experienced error ${error}`);
        });
    }

    protected buildPacket(param: string, value: number) {
        let packet = {
            "action": param,
            "data": value
        };
        return packet;
    }
}

export { ConnectorWarudo };