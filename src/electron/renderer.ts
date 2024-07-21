import { addActionEvents, createHotkeyList, showActionsArea, updateModelInfo } from "../actions";
import { ConnectionStatus, FormType, Intiface } from "../enums";
import { HotkeyData, Settings, VtsAction, VtuberSettings } from "../types";
import "./style.scss";
import { activateTab, closeModal, isDevModeFrontend, showPanel } from "./utils-frontend";
import semver from "semver";

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", initFrontend);
} else {
    // `DOMContentLoaded` has already fired
    initFrontend();
}

function initFrontend() {
    setVersionInfo();
    addEvents();
    versionCheck();
}

function setVersionInfo() {
    let version = process.env.npm_package_version;
    let versionString = `v.${version}`;
    
    document.querySelector("title").textContent += ` ${versionString}`;
    document.querySelector(".version").textContent += ` ${versionString}`;
}

async function isUpdateAvailable() {
    const itchUrl = isDevModeFrontend() ? "https://renpona.neocities.org/test.json" : "https://itch.io/api/1/x/wharf/latest?channel_name=win&game_id=2607448&channel_name=win-release";
    const currentVersion = process.env.npm_package_version;
    let response = await fetch(itchUrl);
    let versionJson: any = await response.json();
    let version = versionJson.latest;

    if (semver.gt(version, currentVersion)) {
        return true;
    } else {
        return false;
    }
}

function createUpdateText(isUpdateAvailable: boolean) {
    let span = document.createElement("span");
    if (isUpdateAvailable) {
        let link = document.createElement("a");
        link.href = "https://renpona.itch.io/rumbling-universal-mayhem-plugin";
        link.target = "_blank";
        link.textContent = "Get it here!";

        span.appendChild(document.createTextNode("Update Available! "));
        span.appendChild(link);
        return span;
    } else {
        span.appendChild(document.createTextNode("Your version of RUMP is up to date!"))
        return span;
    }
}

async function versionCheck() {
    let updateElement = document.querySelector(".update");
    let updateResult = await isUpdateAvailable();
    updateElement.appendChild(createUpdateText(updateResult));
}

function addEvents() {
    let tabList = document.querySelectorAll(".tabs li");
    tabList.forEach((tab) => {
        tab.addEventListener("click", () => {
            activateTab(tab as HTMLElement);
        });
    });

    document.querySelector(".modal-close").addEventListener("click", (event: PointerEvent) => closeModal(event));
    document.querySelector("#intifaceForm").addEventListener("submit", (event: SubmitEvent) => {
        let type: string = (document.querySelector("#intifaceType") as HTMLSelectElement).value;
        event.preventDefault();
        if (event.submitter.classList.contains("disconnectButton")) {
            submitIntifaceDisconnect();
        } else {
            submitIntifaceConnection(type);
        }
    });
    document.querySelector("#intifaceType").addEventListener("input", (event: InputEvent) => {
        let element = event.target as HTMLSelectElement;
        let intifaceType = element.value;
        let dataSection = document.querySelector("#intifaceCentralConnectionData") as HTMLDivElement;

        if (intifaceType == Intiface.Central) {
            dataSection.classList.remove("hidden");
        } else {
            dataSection.classList.add("hidden");
        }
    });

    document.querySelector("#vtuberForm").addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
        if (event.submitter.classList.contains("disconnectButton")) {
            submitVtuberDisconnect();
        } else {
            let protocol = document.querySelector<HTMLSelectElement>("#vtuberProtocol").value;
            let host = document.querySelector<HTMLInputElement>("#vtuberHost").value;
            let port = document.querySelector<HTMLInputElement>("#vtuberPort").value;
            submitVtuberConnection(protocol as string, host as string, parseInt(port as string));
        }
    });

    document.querySelector("#vtuberProtocol").addEventListener("input", (event: InputEvent) => {
        let element = event.target as HTMLSelectElement;
        let protocol = element.value;
        let portField = document.querySelector<HTMLInputElement>("#vtuberPort");
        switch (protocol.toLowerCase()) {
            case "vtubestudio":
                portField.value = "8001";
                break;
            case "vnyan":
                portField.value = "8000";
                break;
            case "warudo":
                portField.value = "19190";
                break;
            case "mtion":
                portField.value = "35393";
                break;
            default:
                console.error("Unexpected vtuber protocol: %s", protocol);
                break;
        }
    });

    addActionEvents();

    window.electronAPI.onUpdateSettings((data: Settings) => {
        // if we do anything on the frontend with config file values, this is the function that would receive them from the backend
        return;
    });

    window.electronAPI.onUpdateStatus((category: FormType, state: ConnectionStatus, message: string) => {
        displayStatus(category, state, message);
    });

    window.electronAPI.onUpdateHotkeyList(createHotkeyList);
    window.electronAPI.onChangeModelVts(updateModelInfo);
}

function displayStatus(category: FormType, state: ConnectionStatus, message: string) {
    //console.log("update %s connection status, state %s, message %s", category, state, message);
    let targetForm: HTMLFormElement = document.querySelector("#" + category + "Form");
    let targetElement: HTMLElement = document.querySelector("#" + category + "Form .status");
    let targetIcon: HTMLElement = document.querySelector(`li.${category} .icon`);
    targetElement.innerText = message;

    targetForm.classList.remove("error", "disconnected", "connected", "connecting");
    targetIcon.classList.remove("has-text-success", "has-text-warning", "has-text-danger");
    targetElement.parentElement.classList.remove("error", "disconnected", "connected", "connecting");

    switch (state) {
        case ConnectionStatus.Connected:
            targetElement.parentElement.classList.add("connected");
            targetIcon.classList.add("has-text-success");
            targetForm.classList.add("connected");
            if (category == FormType.Vtuber) {
                document.querySelectorAll("#vtuberForm select").forEach((element: HTMLSelectElement) => element.disabled = true);
                document.querySelectorAll("#vtuberForm input").forEach((element: HTMLInputElement) => element.disabled = true);
                let protocol = document.querySelector("#vtuberProtocol") as HTMLSelectElement;
                if (protocol.value.toLowerCase() == "vtubestudio") {
                    showActionsArea(true);
                }
            }
            if (category == FormType.Intiface) {
                document.querySelectorAll("#intifaceForm select").forEach((element: HTMLSelectElement) => element.disabled = true);
                document.querySelectorAll("#intifaceForm input").forEach((element: HTMLInputElement) => element.disabled = true);
            }
            break;
        case ConnectionStatus.Error:
            targetElement.parentElement.classList.add("error");
            targetIcon.classList.add("has-text-danger");
            targetForm.classList.add("error");
            break;
        case ConnectionStatus.Connecting:
            targetElement.parentElement.classList.add("connecting");
            targetIcon.classList.add("has-text-warning");
            targetForm.classList.add("connecting");
            break;
        case ConnectionStatus.Disconnected:
        case ConnectionStatus.NotConnected:
            targetElement.parentElement.classList.add("disconnected");
            targetIcon.classList.add("has-text-danger");
            targetForm.classList.add("disconnected");
            if (category == FormType.Vtuber) {
                document.querySelectorAll("#vtuberForm select").forEach((element: HTMLSelectElement) => element.disabled = false);
                document.querySelectorAll("#vtuberForm input").forEach((element: HTMLInputElement) => element.disabled = false);
                showActionsArea(false);
            }
            if (category == FormType.Intiface) {
                document.querySelectorAll("#intifaceForm select").forEach((element: HTMLSelectElement) => element.disabled = false);
                document.querySelectorAll("#intifaceForm input").forEach((element: HTMLInputElement) => element.disabled = false);
            }
            break;
        default:
            console.error("displayStatus called with unexpected state: ", state);
            break;
    }
}

function submitIntifaceConnection(type: string) {
    if (type == Intiface.Engine) {
        window.electronAPI.connectIntifaceEngine();
    } else if (type == Intiface.Central) {
        let host = document.querySelector<HTMLInputElement>("#intifaceHost").value as string;
        let port = document.querySelector<HTMLInputElement>("#intifacePort").value as string;
        window.electronAPI.connectIntifaceCentral(host, parseInt(port));
    } else {
        console.error("Invalid Intiface connection type: %s", type);
        return null;
    }
}

function submitIntifaceDisconnect() {
    window.electronAPI.disconnectIntiface();
}

function submitVtuberConnection(protocol: string, host: string, port: number) {
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