import { closeModal, createModal, setModalContent } from "./electron/utils-frontend";
import { DbStores } from "./enums";
import { Database, HotkeyData, VtsAction, VtsActionRecord } from "./types";
import { openDB } from "idb";

//TODO: yeah you know we're replacing this with the real stuff later
let modelId = "testModel";

function addActionEvents() {
    document.querySelector("#actionForm").addEventListener("submit", sendActions);
    document.querySelector("#addActionButton").addEventListener("click", createActionElement);
    document.querySelector("#saveActionSetButton").addEventListener("click", () => {
        createModal(document.querySelector("#saveActionTemplate"));
        document.querySelector(".saveActionSubmit").addEventListener("click", () => {
            let actionSetName = (document.querySelector(".savedActionNameEntry") as HTMLInputElement).value;
            saveActions(actionSetName);
        });
    });
    document.querySelector("#loadActionSetButton").addEventListener("click", () => {
        createModal(document.querySelector("#loadActionTemplate"));
        loadActionSetList(modelId).then(setModalContent);
    });
}

function readActions() {
    let actionList = [];
    let actionElementsList = document.querySelectorAll("#actionForm .action");

    actionElementsList.forEach(actionElement => {
        let minElement = actionElement.querySelector(".rangeMin") as HTMLInputElement;
        let maxElement = actionElement.querySelector(".rangeMax") as HTMLInputElement;
        let minValue = parseInt(minElement.value)
        let maxValue = parseInt(maxElement.value);
        let dataElement = actionElement.querySelector(".hotkeyList") as HTMLSelectElement;
        let validationSuccess = true;

        if (dataElement.value == "none") {
            dataElement.setCustomValidity("You must select an action!");
            maxElement.reportValidity();
            validationSuccess = false;
        } else {
            dataElement.setCustomValidity("");
        }
        if (minValue > maxValue) {
            maxElement.setCustomValidity("Max value must be higher than min value");
            maxElement.reportValidity();
            validationSuccess = false;
        } else {
            maxElement.setCustomValidity("");
        }

        if (validationSuccess) {
            let action: VtsAction = {
                actionName: dataElement.selectedOptions[0].textContent,
                actionType: "hotkeyTrigger",
                actionData: { hotkeyID: dataElement.value },
                vibrateRange: {
                    min: minValue,
                    max: maxValue
                }
            }

            actionList.push(action);
        }
    });

    return actionList;
}

function sendActions(event?: SubmitEvent) {
    if (event) event.preventDefault();

    let actionList = readActions();

    if (actionList.length > 0) {
        console.log("Submitting action list");
        window.electronAPI.vtsActionSubmit(actionList);
    } else {
        console.warn("Tried to submit actions list, but it was empty");
    }
}

function clearActions() {
    let actionForm = document.querySelector("#actionForm") as HTMLFormElement;
    let deleteList = actionForm.querySelectorAll<HTMLElement>(".delete");

    deleteList.forEach((deleteButton) => {
        deleteButton.click();
    })
}

function createActionElement(event?: PointerEvent) {
    if (event) event.preventDefault();
    let actionForm = document.querySelector("#actionForm") as HTMLFormElement;
    let actionTemplate = document.querySelector("#actionTemplate") as HTMLTemplateElement;
    let actionNode = actionTemplate.content.cloneNode(true) as HTMLElement;
    actionNode.children[0].querySelector(".delete").addEventListener("click", deleteAction);

    actionForm.appendChild(actionNode);
}

function createActionElementFromData(data: VtsAction) {
    let actionForm = document.querySelector("#actionForm") as HTMLFormElement;
    let actionTemplate = document.querySelector("#actionTemplate") as HTMLTemplateElement;
    let actionNode = actionTemplate.content.cloneNode(true) as HTMLElement;
    actionNode.children[0].querySelector(".delete").addEventListener("click", deleteAction);

    (actionNode.querySelector(".rangeMin") as HTMLInputElement).value = data.vibrateRange.min.toString();
    (actionNode.querySelector(".rangeMax") as HTMLInputElement).value = data.vibrateRange.max.toString();
    (actionNode.querySelector(".hotkeyList") as HTMLSelectElement).value = data.actionData.hotkeyID;

    actionForm.appendChild(actionNode);
}

function createHotkeyList(data: HotkeyData[]) {
    let selectTemplate = document.querySelector("#hotkeyTemplate") as HTMLTemplateElement;
    let selectElement = selectTemplate.content.querySelector(".hotkeyList") as HTMLSelectElement;

    if (selectElement.options.length > 1) {
        // we want to leave the original "none" element, so start from index 1 rather than 0
        for (let index = 1; index < selectElement.options.length; index++) {
            selectElement.options.remove(index);
        }
    }

    data.forEach(hotkey => {
        let hotkeyOption: HTMLOptionElement = document.createElement("option");
        hotkeyOption.appendChild(document.createTextNode(`${hotkey.type}: ${hotkey.name}`));
        hotkeyOption.value = hotkey.hotkeyID;
        selectElement.appendChild(hotkeyOption);
    });

    let actionTemplate = document.querySelector("#actionTemplate") as HTMLTemplateElement;
    actionTemplate.content.querySelector(".hotkeyContainer").appendChild(selectTemplate.content.cloneNode(true));
}

function deleteAction(event: PointerEvent) {
    event.preventDefault();
    let deleteButton = event.target as HTMLButtonElement;
    deleteButton.parentElement.remove();
    readActions();
}

async function saveActions(actionSetName: string) {
    // TODO: need to watch for model changes and feed an event to the frontend, since hotkeys are model specific
    //const modelId: string = await getModelId();
    const modelId = "testModel";

    let actionList = readActions();
    let savedActionData = {
        actionSetName: actionSetName,
        modelId: modelId,
        actionList: actionList
    }
    console.log(savedActionData);
    closeModal();
    return createActionsDb().then((db) => db.put(DbStores.SavedActions, savedActionData));
}

async function loadActionSetList(modelId: string) {
    let db = await createDb(DbStores.SavedActions, "actionSetName");
    let query = IDBKeyRange.only(modelId);
    let cursor = await db.transaction(DbStores.SavedActions, "readonly").store.index("modelId").openCursor(query);
    let actionSetList: String[] = [];
    let actionSetHtml = document.createDocumentFragment();
    while (cursor) {
        actionSetList.push(cursor.value.actionSetName);
        actionSetHtml.appendChild(createActionSetElement(cursor.value.actionSetName));
        cursor = await cursor.continue();
    }

    if (!actionSetList) {
        let content = document.createElement("span");
        content.textContent = "No saved action sets found!";
        return content;
    } else {
        return actionSetHtml;
    }
}

async function loadSingleActionSet(name: string) {
    let db = await createDb(DbStores.SavedActions, "actionSetName");
    return await db.get(DbStores.SavedActions, name);
}

function loadActionState(record: VtsActionRecord) {
    clearActions();
    record.actionList.forEach((actionItem) => {
        createActionElementFromData(actionItem);
    });
    sendActions();
    closeModal();
}

function createActionSetElement(name: string) {
    let container = document.createElement("div");
    container.classList.add("box", "actionSetElement");

    let title = document.createElement("h3");
    title.textContent = name;

    container.appendChild(title);
    container.addEventListener("click", () => loadSingleActionSet(name).then(loadActionState));
    return container;
}

async function createActionsDb() {
    return createDb(DbStores.SavedActions, "actionSetName");
}

async function createDb(store: DbStores, keyPath: string) {
    const dbName = "rump";
    const dbVersion = 1;

    const db = await openDB<Database>(dbName, dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
            const objectStore = db.createObjectStore(store, { keyPath: keyPath });
            objectStore.createIndex("modelId", "modelId", { unique: false });
        },
        blocked(currentVersion, blockedVersion, event) {
            console.log(`createDb for store ${store} failed due to being blocked: ${event}`);
        },
        blocking(currentVersion, blockedVersion, event) {
            console.warn(`An version increase was requested on the RUMP db.`);
            db.close();
        },
        terminated() {
            console.error(`Connection to RUMP db was closed unexpectedly.`);
        },
    });

    return db;
}

export { addActionEvents, createActionElement, createHotkeyList }