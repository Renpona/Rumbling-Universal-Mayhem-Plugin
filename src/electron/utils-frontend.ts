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

export { createModal, closeModal, getModalContainer, getModalContent, setModalContent }