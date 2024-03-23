import { ApiClient, HotkeyType, VTubeStudioError } from "vtubestudio";
import { ConnectionStatus, FormType, Protocol } from "./enums";
import { pluginName } from "./utils";
import { updateHotkeyList, updateStatus } from "./electron/electronMain";
import ws from "ws";
import { ActionHotkey, HotkeyData, VtsAction, VtuberSoftware } from "./types";
import { getLogger } from "./loggerConfig";

const fs = require("node:fs");

const category = FormType.Vtuber;

class ConnectorVtubestudio implements VtuberSoftware {
    software: Protocol = Protocol.VtubeStudio;
    isConnected: boolean = false;
    logger = getLogger();
    actionList: VtsAction[] = [];

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
        let logger = this.logger;
        this.options.url = `ws://${host}:${port}`;
        try {
            updateStatus(category, ConnectionStatus.Connecting, `Attempting to connect to ${this.software}...`);
            this.apiClient = new ApiClient(this.options);
        } catch(e) {
            logger.error(e);
            updateStatus(category, ConnectionStatus.Error, e.toString());
            return;
        }

        // in certain cases, such as wrong URL, VTS won't connect but also won't throw an error or fire an error event
        // so wait a few seconds and check isConnecting and isConnected if no event has fired yet
        let timer = setTimeout(() => {
            if (!this.apiClient.isConnecting && !this.apiClient.isConnected) {
                logger.warn(`Failed to connect to ${name} after 5 seconds.`);
                updateStatus(category, ConnectionStatus.NotConnected, `Failed to connect to ${name} after 5 seconds.`);
            }
        }, 5000);
        this.apiClient.on("connect", () => {
            logger.info(`${name} connected!`);
            updateStatus(category, ConnectionStatus.Connected, `${name} connected!`);
            this.isConnected = true;
            this.addParam();
            this.getHotkeysList();
            clearTimeout(timer);
        });
        this.apiClient.on("error", (e: string) => {
            logger.error(`${name} disconnected with error: \n${e}`);
            updateStatus(category, ConnectionStatus.Error, `${name} disconnected with error: \n${e}`);
            if (this.apiClient.isConnected) this.disconnect();
            this.isConnected = false;
            this.endParamRefresher();
            clearTimeout(timer);
        });
        this.apiClient.on("disconnect", () => {
            logger.info(`Disconnected from ${name}`);
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
        //this.logger.debug("Param data: %o", paramData);
        this.apiClient
            .injectParameterData(paramData)
            .catch((e: VTubeStudioError) => {
                this.logger.error("Failed to send param data %s: %s", param, e.data.message);
                updateStatus(category, ConnectionStatus.Error, "VTubeStudio connection error: Code " + e.data.errorID.toString() + "\n" + e.data.message);
            })
            .then(this.startParamRefresher());

        if (this.actionList) this.runVtsActions(value);

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
            this.logger.debug("Starting VTubeStudio param refresh timer.");
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
        this.logger.debug("Terminating VTubeStudio param refresh timer.");
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
        let logger = this.logger;
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
                logger.info("Successfully added parameter: %s", response.parameterName);
            })
            .catch((e) => {
                logger.error(`Failed to add parameter: ${e.errorID} ${e.message}`);
            });
        this.apiClient
            .parameterCreation(vibrateParam)
            .then((response) => {
                logger.info("Successfully added parameter: %s", response.parameterName);
            })
            .catch((e) => {
                logger.error(`Failed to add parameter: ${e.errorID} ${e.message}`);
            });
    }

    public getHotkeysList() {
        this.logger.verbose("Attempting to fetch VTS hotkey list.");
        this.apiClient.hotkeysInCurrentModel().then((response) => {
            this.logger.debug("%o", response);
            updateHotkeyList(response.availableHotkeys);
        });
    }
    
    public registerActions(actionList: VtsAction[]) {
        this.logger.verbose(`Saving VTS Action List with ${actionList.length} elements`);
        this.logger.debug("%o", actionList);
        this.actionList = actionList;
        return;
    }

    private runVtsActions(vibrateValue: number) {
        const actionList = this.actionList;

        actionList.forEach(action => {
            this.logger.debug("Checking VTS action %o", action);
            if (this.compareVibrateValue(action, vibrateValue)) {
                this.executeAction(action.actionType, action.actionData);
            }
        });
    }

    private compareVibrateValue(action: VtsAction, vibrateValue: number) {
        const vibrateRange = action.vibrateRange;
        let pastValue: number;
        let currentValue: number = vibrateValue * 100;
        let currentTrigger: boolean;
        let previousTrigger: boolean;

        if (this.paramState && this.paramState.Vibrate) {
            pastValue = this.paramState.Vibrate * 100;
        } else {
            return false;
        }
        this.logger.debug(`Comparing current vibrate value ${currentValue} and past value ${pastValue} against action range ${vibrateRange.min} - ${vibrateRange.max}`);

        if (currentValue >= vibrateRange.min && currentValue <= vibrateRange.max) {
            currentTrigger = true;
        } else {
            currentTrigger = false;
        }
        
        if (pastValue >= vibrateRange.min && pastValue <= vibrateRange.max) {
            previousTrigger = true;
        } else {
            previousTrigger = false;
        }

        console.debug(`prev match is ${previousTrigger}, curr match is ${currentTrigger}`);
        if (previousTrigger != currentTrigger) {
            return true;
        } else {
            return false;
        }
    }


    private executeAction(type: VtsAction["actionType"], data: VtsAction["actionData"]) {
        this.logger.verbose(`Executing action ${type}`);
        this.logger.debug(`with data ${data}`);
        switch (type) {
            case "hotkeyTrigger":
                this.sendHotkeyAction(data);
                break;
        
            default:
                this.logger.warn("Tried to execute VtsAction with unknown type");
                break;
        }
    }

    private sendHotkeyAction(data: ActionHotkey) {
        this.apiClient.hotkeyTrigger(data).catch((error) => this.logger.error(`Sending hotkey data failed with error ${error}`));
    }
}

export { ConnectorVtubestudio }