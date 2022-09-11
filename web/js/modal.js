import updateThemeColor from "./theming";
window.addEventListener("popstate", function (e) {
    console.log("New history state:", e);
    const currentlyOpenModal = document.querySelector(".modal.open");
    if (currentlyOpenModal !== null) {
        console.log("have modal open and navigating away - discarding modal");
        discardModalForce();
    }
});
let lastModalZIndex = 100;
function discardModal(e) {
    console.log("discardModal", e);
    if (e !== undefined && !e.target.classList.contains("modal")) {
        console.log("ignoring discardmodal cause inside of modal");
        return;
    }
    var openModals = [...document.querySelectorAll(".modal.open")].sort(
        (a, b) => parseInt(a.style.zIndex) > parseInt(b.style.zIndex)
    );
    openModals[openModals.length - 1].classList.remove("open");
    console.log("discarding", openModals[openModals.length - 1]);
    updateThemeColor();
    if (document.querySelectorAll(".modal.open").length === 0) {
        document.body.classList.remove("modal-open");
    }
    if (location.hash === "#modal") {
        console.log("only have one modal open - navigating back");
        history.back();
    }
}

window.discardModal = discardModal;
const discardModalForce = () => discardModal();
window.discardModalForce = discardModalForce;

function openModal(modal, event) {
    if (event !== undefined) {
        console.log("prevented default");
        event.preventDefault();
    }
    modal.style.zIndex = lastModalZIndex;
    lastModalZIndex++;
    if (!location.hash === "#modal") {
        history.pushState(
            {
                currentState: "modal",
            },
            "",
            window.location.pathname + window.location.search + "#modal"
        );
    }
    console.log("opening modal", modal);
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    console.log("this:", this);

    updateThemeColor();
}

window.openModal = openModal;
export { discardModal, discardModalForce, openModal };
