import { ConnectionStatus, FormType, Protocol } from "./enums";
import { ConnectionInfo, MtionAction, MtionParam, MtionParamData, MtionTrigger, VtuberSoftware } from "./types";
import { updateStatus } from "./electron/electronMain";
import { getLogger } from "./loggerConfig";
import fetch from "node-fetch";

const category = FormType.Vtuber;

class ConnectorMtion implements VtuberSoftware {
    software: Protocol = Protocol.Mtion;
    isConnected: boolean = false;
    logger = getLogger();
    connectionInfo: ConnectionInfo;
    private rumpNode: MtionTrigger;
    private vibrateParam: MtionParam;

    async connect(host: string, port: number) {
        this.logger.info("Connecting to Mtion");
        this.connectionInfo = {
            host: host,
            port: port
        };
        const response = await this.getTriggersList();
        if (response) {
            const data = await response.json() as MtionTrigger[];
            this.rumpNode = this.findRumpNode(data);
            if (this.rumpNode) {
                this.vibrateParam = this.findVibrateParam(this.rumpNode.output_parameters);
                updateStatus(FormType.Vtuber, ConnectionStatus.Connected, "Mtion connected and RUMP node detected!");
            } else {
                this.fakeDisconnect("RUMP node not found in current clubhouse interactions");
                return;
            }
        }
    }

    disconnect() {
        // unlike the other connectors, Mtion doesn't use a websocket or maintain a continuous connection, so there isn't actually anything to disconnect from
        this.fakeDisconnect("Disconnected from Mtion");
        return;
    };

    sendData(param: string, value: number) {
        if (param == "Vibrate") {
            let payload: MtionParamData = {
                parameter_index: this.vibrateParam.parameter_index,
                value: value
            }
            this.fireExternalTrigger([payload]);
        }
    };

    registerActions(action: MtionAction[]) {
        return;
    };

    private fakeDisconnect(message: string) {
        this.logger.info(message);
        updateStatus(FormType.Vtuber, ConnectionStatus.Disconnected, message);
        this.rumpNode = undefined;
    }

    private async getTriggersList() {
        this.logger.info("Requesting triggers list from Mtion.");
        const response = await fetch(`${this.getBaseUrl()}/external-trigger/triggers`);
        if (response && response.status == 200) {
            this.logger.info("Mtions trigger list received!");
            return response;
        } else {
            this.logger.warn(`Failed to retrieve trigger from Mtion, with error code ${response.status}`);
            updateStatus(FormType.Vtuber, ConnectionStatus.Error, `Mtion connection failed with error ${response.status}: ${response.statusText}!`);
            return null;
        }
    }

    private async fireExternalTrigger(payload: MtionParamData[]) {
        const url = `${this.getBaseUrl()}/external-trigger/fire-trigger/${this.rumpNode.id}`;
        this.logger.info("Sending data to Mtion");
        this.logger.debug(url);
        const response = await fetch(url, {
            method: "PATCH",
            body: JSON.stringify(payload)
        });
    }

    private getBaseUrl() {
        return `http://${this.connectionInfo.host}:${this.connectionInfo.port}`;
    }

    private findRumpNode(data: MtionTrigger[]) {
        let rumpNode = null;
        data.forEach((element) => {
            if (element.name == "RUMP") {
                rumpNode = element;
            };
        });
        return rumpNode;
    }

    private findVibrateParam(data: MtionParam[]) {
        let vibrateParam = null;
        data.forEach((element) => {
            if (element.name == "Vibrate") {
                vibrateParam = element;
            }
        });
        return vibrateParam;
    }
}

export { ConnectorMtion }