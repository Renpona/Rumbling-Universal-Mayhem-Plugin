import { ConnectionStatus, FormType, Protocol } from "./enums";
import { MtionAction, VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";
import http from 'node:http';

const category = FormType.Vtuber;

class ConnectorMtion implements VtuberSoftware {
    software: Protocol = Protocol.Mtion;
    isConnected: boolean = false;
    logger = getLogger();

    connect(host: string, port: number) {
        http.request(`${host}:${port}`);
    };

    disconnect() {
        return;
    };

    sendData(param: string, value: number) {
        return;
    };

    registerActions(action: MtionAction[]) {
        return;
    };
}

export { ConnectorMtion }