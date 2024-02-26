import { pluginName } from "./utils";

// CommonJS/Require
const fs = require("node:fs");
const ws = require("ws");
const vts = require("vtubestudio");
const ApiClient = vts.ApiClient;

function setAuthToken(authenticationToken) {
    // store the authentication token somewhere
    fs.writeFileSync("./auth-token.txt", authenticationToken, {
        encoding: "utf-8",
    });  
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
    webSocketFactory: (url) => new ws(url),

    // default URL, to be overwritten if new info provided
    url: "ws://localhost:8001",
};

var apiClient;

function connectVTubeStudio(host, port) {
    options.url = `ws://${host}:${port}`;
    apiClient = new ApiClient(options);
    addParam();
    return apiClient;
}

function addParam() {
    const linearParam = {
        parameterName: "Linear",
        description: "Linear actuator position",
        defaultValue: 0,
        min: 0,
        max: 1
    };
    const vibrateParam = {
        parameterName: "Vibrate",
        description: "Vibration level",
        defaultValue: 0,
        min: 0,
        max: 1
    }
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
        mode: "set",
        "parameterValues": [
            {
                "id": param,
                "value": value,
            }
        ]
    }
    apiClient
        .injectParameterData(paramData)
        .catch((e) => {
            console.error("Failed to send param data %s:", param, e.errorID, e.message);
        });
}

export { connectVTubeStudio, sendParamValue }