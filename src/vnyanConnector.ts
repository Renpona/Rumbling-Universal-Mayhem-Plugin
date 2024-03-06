import { WebSocket } from "ws";
import { ConnectionStatus, FormType, Protocol } from "./enums";
import { VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";

/*

ws://localhost:8000/vnyan
test 100

*/

const category = FormType.Vtuber;

class ConnectorVnyan implements VtuberSoftware {
    software: Protocol = Protocol.Vnyan;
    ws: WebSocket;
    isConnected: boolean = false;

    public connect(host: string, port: number) {
        this.ws = new WebSocket(`ws://${host}:${port}/vnyan`);
        this.setWebsocketListeners();
    }

    public disconnect() {
        this.ws.close(1000, "Disconnect method called");
    }

    public sendData(param: string, value: number) {
        let packet = this.buildPacket(param, (value * 100));
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
        let packet = param + " " + value.toString();
        return packet;
    }
}

export { ConnectorVnyan }