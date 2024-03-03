import { Settings, VtuberSettings } from "../types";

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", addEvents);
} else {
    // `DOMContentLoaded` has already fired
    addEvents();
}

function addEvents() {
    document.querySelector("#intifaceForm").addEventListener("formdata", (event: FormDataEvent) => {
        event.preventDefault();
        let host = document.querySelector<HTMLInputElement>("#intifaceHost").value;
        let port = document.querySelector<HTMLInputElement>("#intifacePort").value;
        submitIntifaceConnection(host as string, parseInt(port as string));
    });
    
    document.querySelector("#vtuberForm").addEventListener("formdata", (event: FormDataEvent) => {
        event.preventDefault();
        let host = document.querySelector<HTMLInputElement>("#vtuberHost").value;
        let port = document.querySelector<HTMLInputElement>("#vtuberPort").value;
        submitVtuberConnection(host as string, parseInt(port as string));
    });
    
    window.electronAPI.onUpdateSettings((data: Settings) => {
        populateDefaults(data);
    });    
}

function populateDefaults(settings: Settings) {
    document.querySelector<HTMLInputElement>("#intifaceHost").value = settings.intiface.host;
    document.querySelector<HTMLInputElement>("#intifacePort").value = settings.intiface.port.toString();
    document.querySelector<HTMLInputElement>("#vtuberHost").value = settings.vtuber.host;
    document.querySelector<HTMLInputElement>("#vtuberPort").value = settings.vtuber.port.toString();
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