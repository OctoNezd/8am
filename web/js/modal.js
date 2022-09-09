import updateThemeColor from "./theming";

function discardModal(e) {
    console.log("discardModal", e);
    if (e !== undefined && !e.target.classList.contains("modal")) {
        console.log("ignoring discardmodal cause inside of modal");
        return;
    }
    document.body.classList.remove("modal-open");
    document
        .querySelectorAll(".modal.open")
        .forEach((modal) => modal.classList.remove("open"));
    updateThemeColor();
    history.pushState(
        {
            currentState: "normal",
        },
        "",
        window.location.pathname + window.location.search
    );
}

window.discardModal = discardModal;
const discardModalForce = () => discardModal();
window.discardModalForce = discardModalForce;

function openModal(modal, event) {
    discardModalForce();
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    console.log("this:", this);
    if (event !== undefined) {
        console.log("prevented default");
        event.preventDefault();
    }
    history.pushState(
        {
            currentState: "modal",
        },
        "",
        window.location.pathname + window.location.search + "#modal"
    );
    updateThemeColor();
}

window.openModal = openModal;
export { discardModal, discardModalForce, openModal };
