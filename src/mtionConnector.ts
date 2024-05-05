import { ConnectionStatus, FormType, Protocol } from "./enums";
import { MtionAction, VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";


const category = FormType.Vtuber;

class ConnectorMtion implements VtuberSoftware {
    software: Protocol = Protocol.Mtion;
    isConnected: boolean = false;
    logger = getLogger();

    connect(host: string, port: number) {
        const list = fetch(`http://${host}:${port}/external-trigger/triggers`).then((response) => {return response.json()});
        this.logger.debug(list);
    };

    disconnect() {
        
    };

    sendData(param: string, value: number) {
        
    };

    registerActions(action: MtionAction[]) {
        
    };
}
