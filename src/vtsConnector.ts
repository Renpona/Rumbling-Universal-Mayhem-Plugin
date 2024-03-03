import { ApiClient, VTubeStudioError } from "vtubestudio";
import { ConnectionStatus, ExitCode, FormType } from "./enums";
import { errorHalt, pluginName } from "./utils";
import { updateStatus } from "./electron/electronMain";
import { cancelUpdate } from "./intifaceConnector";
import ws from "ws";

const fs = require("node:fs");

const category = FormType.Vtuber;

function setAuthToken(authenticationToken) {
    // store the authentication token somewhere
    fs.writeFileSync("./auth-token.txt", authenticationToken, {
        encoding: "utf-8",
    });
    return Promise.resolve();
}

function getAuthToken() {
    // retrieve the stored authentication token
    return fs.readFileSync("./auth-token.txt", "utf-8");
}

const options = {
    authTokenGetter: getAuthToken,
    authTokenSetter: setAuthToken,
    pluginName: pluginName,
    pluginDeveloper: "Renpona",
    webSocketFactory: (url: string) => new ws(url),

    // default URL, to be overwritten if new info provided
    url: "ws://localhost:8001",
};

var apiClient: ApiClient;

function connectVTubeStudio(host: string, port: number) {
    options.url = `ws://${host}:${port}`;
    try {
        updateStatus(category, ConnectionStatus.Connecting, "Attempting to connect to VTubeStudio...");
        apiClient = new ApiClient(options);
    } catch(e) {
        console.error(e);
        updateStatus(category, ConnectionStatus.Error, e.toString());
        return;
    }
    // in certain cases, such as wrong URL, VTS won't connect but also won't throw an error or fire an error event
    // so wait a few seconds and check isConnecting and isConnected if no event has fired yet
    let timer = setTimeout(() => {
        if (!apiClient.isConnecting && !apiClient.isConnected) {
            updateStatus(category, ConnectionStatus.NotConnected, "Failed to connect after 5 seconds");
        }
    }, 5000);
    apiClient.on("connect", () => {
        updateStatus(category, ConnectionStatus.Connected, "VTubeStudio connected!");
        addParam();
        clearTimeout(timer);
    });
    apiClient.on("error", (e: string) => {
        updateStatus(category, ConnectionStatus.Error, "VTubeStudio disconnected with error: \n" + e);
        clearTimeout(timer);
    });
    apiClient.on("disconnect", () => {
        updateStatus(category, ConnectionStatus.Disconnected, "Disconnected from VTubeStudio");
        clearTimeout(timer);
    });
    
    
    return apiClient;
}

function disconnectVtubeStudio() {
    apiClient.disconnect();
}

function addParam() {
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
    
    apiClient
        .parameterCreation(linearParam)
        .then((response) => {
            console.log("Successfully added parameter:", response.parameterName);
        })
        .catch((e) => {
            console.error("Failed to add parameter:", e.errorID, e.message);
        });
    apiClient
        .parameterCreation(vibrateParam)
        .then((response) => {
            console.log("Successfully added parameter:", response.parameterName);
        })
        .catch((e) => {
            console.error("Failed to add parameter:", e.errorID, e.message);
        });
}

function sendParamValue(param: string, value: number) {
    let paramData = {
        mode: "set" as "set",
        "parameterValues": [
            {
                "id": param,
                "value": value,
            }
        ]
    }
    apiClient
        .injectParameterData(paramData)
        .catch((e: VTubeStudioError) => {
            console.error("Failed to send param data %s:", param, e.data.message);
            updateStatus(category, ConnectionStatus.Error, "VTubeStudio connection error: Code " + e.data.errorID.toString() + "\n" + e.data.message);
            cancelUpdate();
        });
}

export { connectVTubeStudio, disconnectVtubeStudio, sendParamValue }