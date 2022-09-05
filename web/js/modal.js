import updateThemeColor from "./theming";

export function openModal(modal) {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
}
window.discardModal = function () {
    document.body.classList.remove("modal-open");
    document
        .querySelectorAll(".modal.open")
        .forEach((modal) => modal.classList.remove("open"));
    updateThemeColor();
};
