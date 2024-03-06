import { WebSocket } from "ws";
import { Protocol } from "./enums";
import { VtuberSoftware } from "./types";

/*

ws://localhost:8000/vnyan
test 100

*/

class ConnectorVnyan implements VtuberSoftware {
    software: Protocol = Protocol.Vnyan;
    ws: WebSocket;
    isConnected: boolean = false;

    public connect(host: string, port: number) {
        this.ws = new WebSocket(`ws://${host}:${port}/vnyan`);
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
        let packet = `${param} ${value}`;
        return packet;
    }
}

export { ConnectorVnyan }