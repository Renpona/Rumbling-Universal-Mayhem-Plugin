import WebSocket from 'ws';
import { errorHalt, pluginName } from './utils';
import { ConnectionStatus, ExitCode, FormType, Intiface } from './enums';
import { intifaceEvent, startIntifaceEngine, stopIntifaceEngine } from "./engineManager";
import { updateStatus } from './electron/electronMain';
import { sendVtuberParamData } from './startup';
import { getLogger } from './loggerConfig';
import { ChildProcess } from 'child_process';
import { ConnectionInfo, IntifaceSettings } from './types';

//const ws = new WebSocket('ws://127.0.0.1:54817');

class IntifaceInstance {
    logger = getLogger();
    protected readonly DEVICE_ADDRESS: string = "V9T8S7";
    protected readonly identifier = {
        "identifier": pluginName,
        "address": this.DEVICE_ADDRESS,
        "version": 0
    };
    protected intifaceType: Intiface;
    protected connection: WebSocket;
    protected engine: ChildProcess = null;

    protected static readonly linearRegex = /L\d+/i;
    protected static readonly vibrateRegex = /V\d+/i;

    constructor(intifaceType: Intiface) {
        this.intifaceType = intifaceType;
    }

    start(connectionInfo?: ConnectionInfo) {
        if (this.intifaceType == Intiface.Engine) {
            this.startEngine(connectionInfo);
        } else if (this.intifaceType == Intiface.Central && connectionInfo) {
            this.connectIntiface(connectionInfo);
        } else {
            this.logger.warn("Intiface instance start called with invalid parameters: %s, %o", this.intifaceType, connectionInfo);
        }
    }

    startEngine(customConnection?: ConnectionInfo) {
        let connectionInfo: ConnectionInfo;
        if (customConnection) {
            connectionInfo = customConnection;
        } else {
            connectionInfo = {
                host: "localhost",
                port: 54817
            }
        }

        intifaceEvent.once("ready", () => this.connectIntiface(connectionInfo));
        intifaceEvent.once("errorShutdown", (message: string) => {
            this.disconnectIntiface();
            this.stopEngine();
            this.logger.warn(message);
            let uiMessage: string;
            if (message.includes("Only one usage of each socket address")) {
                uiMessage = "Intiface Engine failed to start due to port collision. If Intiface Central is already running, this is normal - use the dropdown above to connect to it!";
            } else {
                uiMessage = message;
            }
            updateStatus(FormType.Intiface, ConnectionStatus.Error, `Intiface Engine shutdown with error: \n${uiMessage}`);
        });

        this.logger.info("Initializing Intiface Engine...");
        updateStatus(FormType.Intiface, ConnectionStatus.Connecting, "Starting Intiface Engine...");
        this.engine = startIntifaceEngine();
    }

    stopEngine() {
        intifaceEvent.removeAllListeners("ready");
        this.logger.info("Shutting down Intiface Engine...");
        let result = stopIntifaceEngine(this.engine);
        this.engine = null;
        return result;
    }

    connectIntiface(connectionInfo: ConnectionInfo) {
        let host = connectionInfo.host;
        let port = connectionInfo.port;
        let logger = getLogger();
        let instance = this;
        logger.info("Trying to connect to Intiface...");
        const ws = new WebSocket(`ws://${host}:${port}`);
    
        ws.on('error', logger.error);
    
        ws.on('close', function close(code, reason) {
            logger.info("Disconnected from Intiface for reason: %s", reason.toString());
            if (instance.engine) {
                instance.stopEngine();
            }
            updateStatus(FormType.Intiface, ConnectionStatus.Disconnected, "Intiface disconnected!");
        });
    
        ws.on('open', function open() {
            let handshake = JSON.stringify(instance.identifier);
            logger.info("Connected to Intiface!");
            logger.debug('sent: %s', handshake);
            updateStatus(FormType.Intiface, ConnectionStatus.Connected, "Intiface connected!");
            ws.send(handshake);
        });
    
        ws.on('message', function message(data) {
            let result = data.toString().trim();
            logger.verbose('Received TCode data: %s', result);
            
            let linearValue = IntifaceInstance.linearParse(result);
            if (linearValue != null) logger.verbose('Linear: %s', linearValue);
            instance.state.linearValue = linearValue;
            
            let vibrateValue = IntifaceInstance.vibrateParse(result);
            if (vibrateValue != null) logger.verbose('Vibrate: %s', vibrateValue);
            instance.state.vibrateValue = vibrateValue;
    
            instance.update();
        });

        this.connection = ws;
        return ws;
    }

    disconnectIntiface() {
        if (this.connection) {
            return this.connection.close(1000, "Disconnect method called");
        } else {
            getLogger().warn("disconnectIntiface called while no Intiface connection exists");
            return null;
        }
    }

    static linearParse(data: string) {
        let linearData = data.match(this.linearRegex);
        if (linearData != null) {
            let rawPosition: string = linearData[0].slice(2); //remove identifier and channel
            let position: number = Number(rawPosition)/100;
            return position;
        } else {
            return null;
        }
    }

    static vibrateParse(data: string) {
        let vibrateData = data.match(this.vibrateRegex);
        if (vibrateData != null) {
            let rawVibrate: string = vibrateData[0].slice(2); //remove identifier and channel
            let vibrate: number = Number(rawVibrate)/100;
            return vibrate;
        } else {
            return null;
        }
    }

    updateTimer: NodeJS.Timeout;
    state = {
        linearValue: 0,
        vibrateValue: 0
    };
    update() {
        let state = this.state;
        if (state.linearValue != null) sendVtuberParamData("Linear", state.linearValue);
        if (state.vibrateValue != null) sendVtuberParamData("Vibrate", state.vibrateValue);
    }
}

export { IntifaceInstance };