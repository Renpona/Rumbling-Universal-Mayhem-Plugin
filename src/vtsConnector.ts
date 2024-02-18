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
    pluginName: "VTCursed",
    pluginDeveloper: "Renpona",
    webSocketFactory: (url) => new ws(url),

    // Optionally set the URL or port to connect to VTube Studio at; defaults are as below:

    //TODO: add a way to take in host/port info. command line? config file? idk
    //port: 8001,
    //url: "ws://localhost:${port}",
};

function connectToVts() {
    const apiClient = new ApiClient(options);
    return apiClient;
}

