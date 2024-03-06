import { ApiClient, VTubeStudioError } from "vtubestudio";
import { ConnectionStatus, FormType, Protocol } from "./enums";
import { pluginName } from "./utils";
import { updateStatus } from "./electron/electronMain";
import ws from "ws";
import { VtuberSoftware } from "./types";

const fs = require("node:fs");

const category = FormType.Vtuber;

class ConnectorVtubestudio implements VtuberSoftware {
    software: Protocol = Protocol.VtubeStudio;
    isConnected: boolean = false;

    options = {
        authTokenGetter: this.getAuthToken,
        authTokenSetter: this.setAuthToken,
        pluginName: pluginName,
        pluginDeveloper: "Renpona",
        webSocketFactory: (url: string) => new ws(url),
    
        // default URL, to be overwritten if new info provided
        url: "ws://localhost:8001",
    };
    
    apiClient: ApiClient;

    public connect(host: string, port: number) {
        let name = this.software;
        this.options.url = `ws://${host}:${port}`;
        try {
            updateStatus(category, ConnectionStatus.Connecting, `Attempting to connect to ${this.software}...`);
            this.apiClient = new ApiClient(this.options);
        } catch(e) {
            console.error(e);
            updateStatus(category, ConnectionStatus.Error, e.toString());
            return;
        }

        // in certain cases, such as wrong URL, VTS won't connect but also won't throw an error or fire an error event
        // so wait a few seconds and check isConnecting and isConnected if no event has fired yet
        let timer = setTimeout(() => {
            if (!this.apiClient.isConnecting && !this.apiClient.isConnected) {
                updateStatus(category, ConnectionStatus.NotConnected, "Failed to connect after 5 seconds");
            }
        }, 5000);
        this.apiClient.on("connect", () => {
            updateStatus(category, ConnectionStatus.Connected, `${name} connected!`);
            this.isConnected = true;
            this.addParam();
            clearTimeout(timer);
        });
        this.apiClient.on("error", (e: string) => {
            updateStatus(category, ConnectionStatus.Error, `${name} disconnected with error: \n${e}`);
            if (this.apiClient.isConnected) this.disconnect();
            this.isConnected = false;
            this.endParamRefresher();
            clearTimeout(timer);
        });
        this.apiClient.on("disconnect", () => {
            updateStatus(category, ConnectionStatus.Disconnected, `Disconnected from ${name}`);
            this.isConnected = false;
            this.endParamRefresher();
            clearTimeout(timer);
        });
    }

    public disconnect() {
        this.endParamRefresher();
        this.apiClient.disconnect();
    }

    public sendData(param: string, value: number) {
        let paramData = {
            mode: "set" as "set",
            "parameterValues": [
                {
                    "id": param,
                    "value": value,
                }
            ]
        };
        this.apiClient
            .injectParameterData(paramData)
            .catch((e: VTubeStudioError) => {
                console.error("Failed to send param data %s:", param, e.data.message);
                updateStatus(category, ConnectionStatus.Error, "VTubeStudio connection error: Code " + e.data.errorID.toString() + "\n" + e.data.message);
            })
            .then(this.startParamRefresher());

        this.paramState[param] = value;
    };

    private updateTimer: NodeJS.Timeout;
    private paramState = {
        "Linear": null,
        "Vibrate": null
    }

    /**
     * Tracking data sent by VTS expires after 1 second, so these need to be resent frequently to maintain their state.
     * So we keep resending the last received values, if any. If the last received value is 0, then we clear the state so we don't keep constantly resending 0.
     */
    private startParamRefresher() {
        if (!this.updateTimer) {
            this.updateTimer = setInterval(() => {
                this.paramRefresh();
            }, 600);
        };
        return null;
    }

    private paramRefresh() {
        let state = this.paramState;
        if (state.Linear != null) this.sendData("Linear", state.Linear);
        if (state.Vibrate != null) this.sendData("Vibrate", state.Vibrate);
        if (state.Linear == 0) this.paramState.Linear = null;
        if (state.Vibrate == 0) this.paramState.Vibrate = null;
    }

    private endParamRefresher() {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
    }

    private setAuthToken(authenticationToken) {
        // store the authentication token somewhere
        fs.writeFileSync("./auth-token.txt", authenticationToken, {
            encoding: "utf-8",
        });
        return Promise.resolve();
    }
    
    private getAuthToken() {
        // retrieve the stored authentication token
        return fs.readFileSync("./auth-token.txt", "utf-8");
    }

    private addParam() {
        const linearParam = {
            parameterName: "Linear",
            explanation: "Linear actuator position",
            defaultValue: 0,
            min: 0,
            max: 1
        };
        const vibrateParam = {
            parameterName: "Vibrate",
            explanation: "Vibration level",
            defaultValue: 0,
            min: 0,
            max: 1
        };
        
        this.apiClient
            .parameterCreation(linearParam)
            .then((response) => {
                console.log("Successfully added parameter:", response.parameterName);
            })
            .catch((e) => {
                console.error("Failed to add parameter:", e.errorID, e.message);
            });
        this.apiClient
            .parameterCreation(vibrateParam)
            .then((response) => {
                console.log("Successfully added parameter:", response.parameterName);
            })
            .catch((e) => {
                console.error("Failed to add parameter:", e.errorID, e.message);
            });
    }
}

export { ConnectorVtubestudio }