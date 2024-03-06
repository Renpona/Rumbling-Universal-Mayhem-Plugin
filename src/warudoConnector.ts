import { WebSocket } from "ws";
import { VtuberSoftware } from "./types";
import { ConnectionStatus, FormType, Protocol } from "./enums";
import { updateStatus } from "./electron/electronMain";

/*

ws://localhost:19190
{ "action": "test", "data": 100 }

*/

const category = FormType.Vtuber;

class ConnectorWarudo implements VtuberSoftware {
    software: Protocol = Protocol.Warudo;
    ws: WebSocket;
    isConnected: boolean = false;

    public connect(host: string, port: number) {
        this.ws = new WebSocket(`ws://${host}:${port}`);
        this.setWebsocketListeners();
    }

    public disconnect() {
        this.ws.close(1000, "Disconnect method called");
    }

    public sendData(param: string, value: number) {
        let packet = JSON.stringify(this.buildPacket(param, value));
        console.log("%s packet: %o", this.software, packet);
        this.ws.send(packet);
    }

    protected setWebsocketListeners() {
        let connector = this;
        this.ws.on("open", function open() {
            console.log(`Connected to ${connector.software}`);
            updateStatus(category, ConnectionStatus.Connected, `${connector.software} connected!`);
            connector.isConnected = true;
        });

        this.ws.on("close", function close(code, reason) {
            console.log(`Disconnected from ${connector.software} for reason ${reason}`);
            updateStatus(category, ConnectionStatus.Disconnected, `Disconnected from ${connector.software}`);
            connector.isConnected = false;
        });

        this.ws.on("error", function error(error) {
            console.error(`Connection to ${connector.software} experienced error ${error}`);
            updateStatus(category, ConnectionStatus.Error, `${connector.software} disconnected with error: \n${error}`);
            connector.isConnected = false;
        });
    }

    protected buildPacket(param: string, value: number) {
        let packet = {
            "action": param,
            "data": (value * 100)
        };
        return packet;
    }
}

export { ConnectorWarudo };