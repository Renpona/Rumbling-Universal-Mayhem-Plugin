import { WebSocket } from "ws";
import { Action, VtuberSoftware } from "./types";
import { ConnectionStatus, FormType, Protocol } from "./enums";
import { updateStatus, updateVeadoStates } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";

const category = FormType.Vtuber;

class ConnectorVeadotube implements VtuberSoftware {
    software: Protocol = Protocol.Veadotube;
    ws: WebSocket;
    isConnected: boolean = false;
    logger = getLogger();
    actionList: Action[] = [];

    public connect(host: string, port: number) {
        this.ws = new WebSocket(`ws://${host}:${port}?n=RUMP`);
        this.setWebsocketListeners();
    }

    public disconnect() {
        this.ws.close(1000, "Disconnect method called");
    }

    public sendData(param: string, value: number) {
        //TODO:
        let packet = this.buildPacket(param, (value * 100));
        this.logger.verbose("%s packet: %o\n", this.software, packet);
        this.ws.send(packet);
    }

    public registerActions(action: any) {
        //TODO:
        this.logger.error("RegisterActions called on Veadotube connector!");
        return;
    };

    protected setWebsocketListeners() {
        const connector = this;
        const logger = this.logger;
        this.ws.on("open", function open() {
            logger.info(`Connected to ${connector.software}`);
            updateStatus(category, ConnectionStatus.Connected, `${connector.software} connected!`);
            connector.isConnected = true;
        });

        this.ws.on("close", function close(code, reason) {
            logger.info(`Disconnected from ${connector.software} for reason ${reason}`);
            updateStatus(category, ConnectionStatus.Disconnected, `Disconnected from ${connector.software}`);
            connector.isConnected = false;
        });

        this.ws.on("error", function error(error) {
            logger.error(`Connection to ${connector.software} experienced error ${error}`);
            updateStatus(category, ConnectionStatus.Error, `${connector.software} disconnected with error: \n${error}`);
            connector.isConnected = false;
        });

        this.ws.on("message", function message(data, isBinary) {
            logger.debug(`Data received from Veadotube: ${data}`);
            connector.handleResponse(data.toString());
        });
    }

    private sendRequest(data: string) {
        this.logger.verbose(`Sending request: ${data}`);
        this.ws.send(data);
    }

    private getStatesList() {
        this.logger.verbose("Fetching states from Veadotube");
        const payload = {
            "event": "payload",
            "type": "stateEvents",
            "id": "mini",
            "payload": {
                "event": "list"
            }
        }
        const request = `nodes: {
            ${JSON.stringify(payload)}
        }`;
        this.sendRequest(request);
    }

    private subscribeToEvents() {
        //TODO
    }

    private handleResponse(data: string) {
        const i = data.indexOf(":");
        if (i <= 0 || !i) {
            this.logger.warn(`Veado message doesn't match Veado format.`);
        }
        const channel = data.slice(0, i);
        const message = JSON.parse(data.slice(i + 1));

        if (channel == "nodes") {
            if (message.event = "payload") {
                const payload = message.payload;
                if (payload.event = "list") {
                    const states: object[] = payload.states;
                    this.saveStatesList(states);
                }
            }
        }
    }

    private saveStatesList(states: object[]) {
        updateVeadoStates(states);
    }
}