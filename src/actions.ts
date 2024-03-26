import { HotkeyData, VtsAction } from "./types";

function addActionEvents() {
    document.querySelector("#actionForm").addEventListener("submit", saveActions);
    
    document.querySelector("#addActionButton").addEventListener("click", createActionElement);
}

function saveActions(event: SubmitEvent) {
    event.preventDefault();

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
    
    if (actionList.length > 0) {
        console.log("Submitting action list");
        window.electronAPI.vtsActionSubmit(actionList);
    } else {
        console.warn("Tried to submit actions list, but it was empty");
    }
}

function createActionElement(event) {
    event.preventDefault();
    let actionForm = document.querySelector("#actionForm") as HTMLFormElement;
    let actionTemplate = document.querySelector("#actionTemplate") as HTMLTemplateElement;
    let actionNode = actionTemplate.content.cloneNode(true) as HTMLElement;
    actionNode.children[0].querySelector(".delete").addEventListener("click", deleteAction);

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
}

export { addActionEvents, createActionElement, createHotkeyList }