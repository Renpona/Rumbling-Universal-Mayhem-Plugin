import { ConnectionStatus, FormType, Protocol } from "./enums";
import { ConnectionInfo, MtionAction, MtionTrigger, VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";
import fetch from "node-fetch";

const category = FormType.Vtuber;

class ConnectorMtion implements VtuberSoftware {
    software: Protocol = Protocol.Mtion;
    isConnected: boolean = false;
    logger = getLogger();
    connectionInfo: ConnectionInfo;
    private connectionNode: MtionTrigger;

    async connect(host: string, port: number) {
        this.logger.info("Connecting to Mtion");
        const response = await this.getTriggersList(host, port);
        if (response) {
            const data = await response.json() as MtionTrigger[];
            const rumpNode = this.findVibrateNode(data);
            if (rumpNode) {
                this.connectionNode = rumpNode;
            }
        }
    }

    disconnect() {
        // unlike the other connectors, Mtion doesn't use a websocket or maintain a continuous connection, so there isn't actually anything to disconnect from
        this.logger.info("Disconnected from Mtion");
        updateStatus(FormType.Vtuber, ConnectionStatus.Disconnected, "Disconnected from Mtion");
        return;
    };

    sendData(param: string, value: number) {
        return;
    };

    registerActions(action: MtionAction[]) {
        return;
    };

    private async getTriggersList(host: string, port: number) {
        this.logger.info("Requesting triggers list from Mtion.");
        const response = await fetch(`${host}:${port}`);
        if (response && response.status == 200) {
            this.logger.info("Mtions trigger list received!");
            return response;
        } else {
            this.logger.warn(`Failed to retrieve trigger from Mtion, with error code ${response.status}`);
            updateStatus(FormType.Vtuber, ConnectionStatus.Error, `Mtion connection failed with error ${response.status}: ${response.statusText}!`);
            return null;
        }
    }

    private findVibrateNode(data: MtionTrigger[]) {
        data.forEach((element) => {
            if (element.name === "RUMP") return element;
        });
        return null;
    }
}

export { ConnectorMtion }