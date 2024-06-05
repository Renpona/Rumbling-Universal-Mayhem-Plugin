function showPanel(className: string) {
    console.log(`showPanel ${className}`);
    let targetPanel = document.querySelector(`.uiPanel.${className}`) as HTMLElement;
    if (targetPanel.classList.contains("currentPanel")) {
        return;
    } else {
        let panelList = document.querySelectorAll(".uiPanel");
        panelList.forEach((panel) => {
            if (panel.classList.contains(className)) {
                panel.classList.add("currentPanel");
            } else {
                panel.classList.remove("currentPanel");
            }
        });
    }
}

function activateTab(element: HTMLElement) {
    if (element.classList.contains("disabled-tab")) {
        console.log("clicked on disabled tab");
        return;
    } else {
        showPanel(element.className);
    }
}

function createModal(content: HTMLElement) {
    let modalContent: DocumentFragment;
    let type: string;
    if (!content) {
        console.error("createModal called without content");
        return;
    } else if (content.tagName.toUpperCase() == "TEMPLATE") {
        type = content.id;
        modalContent = (content as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment;
    } else {
        modalContent = document.createDocumentFragment();
        modalContent.appendChild(content);
    }

    let modalContainer = getModalContainer() as HTMLDivElement;
    getModalContent().replaceChildren(modalContent);
    modalContainer.className = "modal is-active";

}

function closeModal(event?: PointerEvent) {
    if (event) event.preventDefault();
    document.querySelector("#modal").classList.remove("is-active");
}

function getModalContainer() {
    return document.getElementById("modal");
}

function getModalContent() {
    return getModalContainer().querySelector(".modal-content");
}

function setModalContent(content: HTMLElement | DocumentFragment) {
    getModalContent().replaceChildren(content);
}

function isDevModeFrontend() {
    const mode = process.env.NODE_ENV;
    if (mode == "prod") {
        return false;
    } else {
        return true;
    }
}

export { showPanel, activateTab, createModal, closeModal, getModalContainer, getModalContent, setModalContent, isDevModeFrontend }