import updateThemeColor from "./theming";

export function openModal(modal) {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
}
window.discardModal = function (e) {
    console.log("discardModal", e, e.target);
    if (e !== undefined && !e.target.classList.contains("modal")) {
        console.log("ignoring discardmodal cause inside of modal");
        return;
    }
    document.body.classList.remove("modal-open");
    document
        .querySelectorAll(".modal.open")
        .forEach((modal) => modal.classList.remove("open"));
    updateThemeColor();
};
