import { ConnectionStatus, FormType, Protocol } from "./enums";
import { MtionAction, VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";


const category = FormType.Vtuber;

class ConnectorMtion implements VtuberSoftware {
    software: Protocol = Protocol.Mtion;
    isConnected: boolean = false;

    connect(host: string, port: number) {
        //const list = fetch(`http://${host}:${port}/external-trigger/triggers`);
    };

    disconnect() {
        
    };

    sendData(param: string, value: number) {
        
    };

    registerActions(action: MtionAction[]) {
        
    };
}
