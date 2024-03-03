import { ConnectionStatus, FormType } from "../enums";
import { Settings, VtuberSettings } from "../types";

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", addEvents);
} else {
    // `DOMContentLoaded` has already fired
    addEvents();
}

function addEvents() {
    document.querySelector("#intifaceForm").addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
        if (event.submitter.classList.contains("disconnectButton")) {

        } else {
            let host = document.querySelector<HTMLInputElement>("#intifaceHost").value;
            let port = document.querySelector<HTMLInputElement>("#intifacePort").value;
            submitIntifaceConnection(host as string, parseInt(port as string));
        }
    });
    
    document.querySelector("#vtuberForm").addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
        if (event.submitter.classList.contains("disconnectButton")) {
            submitVtuberDisconnect();
        } else {
            let host = document.querySelector<HTMLInputElement>("#vtuberHost").value;
            let port = document.querySelector<HTMLInputElement>("#vtuberPort").value;
            submitVtuberConnection(host as string, parseInt(port as string));
        }
    });
    
    window.electronAPI.onUpdateSettings((data: Settings) => {
        populateDefaults(data);
    });

    window.electronAPI.onUpdateStatus((category: FormType, state: ConnectionStatus, message: string) => {
        displayStatus(category, state, message);
    });
}

function populateDefaults(settings: Settings) {
    document.querySelector<HTMLInputElement>("#intifaceHost").value = settings.intiface.host;
    document.querySelector<HTMLInputElement>("#intifacePort").value = settings.intiface.port.toString();
    document.querySelector<HTMLInputElement>("#vtuberHost").value = settings.vtuber.host;
    document.querySelector<HTMLInputElement>("#vtuberPort").value = settings.vtuber.port.toString();
}

var connectionState = {
    intiface: false,
    vtuber: false
};



function displayStatus(category: FormType, state: ConnectionStatus, message: string) {
    console.log("update %s connection status, state %s, message %s", category, state, message);
    let targetForm: HTMLSpanElement = document.querySelector("#" + category + "Form");
    let targetElement: HTMLSpanElement = document.querySelector("#" + category + "Form > .status");
    targetElement.innerText = message;

    targetElement.classList.remove("error");
    targetElement.classList.remove("disconnected");
    targetElement.classList.remove("connected");
    targetForm.classList.remove("error");
    targetForm.classList.remove("disconnected");
    targetForm.classList.remove("connected");

    switch (state) {
        case ConnectionStatus.Connected:
            targetElement.classList.add("connected");
            targetForm.classList.add("connected");
            break;
        case ConnectionStatus.Error:
            targetElement.classList.add("error");
            targetForm.classList.add("error");
            break;
        case ConnectionStatus.Disconnected:
        case ConnectionStatus.NotConnected:
            targetElement.classList.add("disconnected");
            targetForm.classList.add("disconnected");
            break;
        default:
            //targetElement.classList.remove("connected");
            //targetElement.classList.remove("error");
            //targetForm.classList.remove("connected");
            //targetForm.classList.remove("error");
            console.error("displayStatus called with unexpected state: ", state);
            break;
    }
}

function submitIntifaceConnection(host: string, port: number) {
    // TODO: revisit this when adding Intiface controls to the UI
    return null;
}

function submitVtuberConnection(host: string, port: number, protocol = "vtubestudio") {
    let settings: VtuberSettings = {
        protocol: protocol,
        host: host,
        port: port
    };
    window.electronAPI.vtuberConnect(settings);
}

function submitVtuberDisconnect() {
    window.electronAPI.vtuberDisconnect();
}