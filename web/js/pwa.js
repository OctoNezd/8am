import updateThemeColor from "./theming";
import "/css/pwa.css";
import htmlHeader from "/html/pwa_header.html";
document.body.insertAdjacentHTML("afterbegin", htmlHeader);
console.log("PWA Elements loaded");
document.body.classList.add("pwa");
function handleConnection() {
    console.log("online?", navigator.onLine);
    if (navigator.onLine) {
        document.body.classList.remove("offline");
    } else {
        document.body.classList.add("offline");
    }
}

window.addEventListener("online", handleConnection);
window.addEventListener("offline", handleConnection);

function setup_pwa_modal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    const button = document.querySelector("#pwa-settings-button");
    window.open_settings_modal = () => {
        modal.classList.add("open");
        document.body.classList.add("modal-open");
        updateThemeColor();
    };
    button.addEventListener("click", open_settings_modal);
    modal.addEventListener("click", discardModal);
    const controls = document.querySelector("#controls");
    controls.querySelectorAll(".knopf").forEach((control) => {
        control.classList.add("pale", "nologos");
    });
    const about = document.querySelector("#about");
    const settingsHeaderText = document.createElement("h3");
    const settingsApplyButton = document.createElement("a");
    settingsApplyButton.classList.add("button", "knopf", "positive");
    settingsApplyButton.id = "pwa-settings-apply";
    settingsApplyButton.href = "#";
    settingsApplyButton.text = "Сохранить настройки";
    settingsApplyButton.addEventListener("click", discardModal);
    settingsHeaderText.innerText = "Настройки PWA";
    const modalBody = document.createElement("div");
    modalBody.id = "pwa-settings-modal";
    modal.appendChild(modalBody);
    modalBody.classList.add("modal-body");
    modalBody.appendChild(settingsHeaderText);
    modalBody.appendChild(controls);
    modalBody.appendChild(about);
    modalBody.appendChild(settingsApplyButton);
    document.body.appendChild(modal);
    console.log("created pwa modal");
}
setup_pwa_modal();
