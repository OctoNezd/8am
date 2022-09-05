import updateThemeColor from "./theming";
let deferredPrompt;
const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
const isIphone =
    [
        "iPad Simulator",
        "iPhone Simulator",
        "iPod Simulator",
        "iPad",
        "iPhone",
        "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (ua.includes("mac") && "ontouchend" in document);
const pwaMediaDetect = window.matchMedia("(display-mode: standalone)").matches;
const urlParams = new URLSearchParams(location.search);
const pwaUrlDetect = urlParams.get("homescreen") === "1";
const isPwa = pwaMediaDetect || pwaUrlDetect;
let pwaDetectType = "Режим страницы";
if (pwaMediaDetect) {
    pwaDetectType = "Режим PWA (display-mode: standalone)";
} else if (pwaUrlDetect) {
    pwaDetectType = "Режим PWA (URLSearchParams)";
}
if (isPwa) {
    pwaDetectType += ` (${location.search})`;
}
console.log(isPwa, pwaDetectType);
export { isPwa, pwaDetectType };
export default function () {
    addEventListener("beforeinstallprompt", (e) => {
        installApp.classList.remove("hidden");
        deferredPrompt = e;
    });

    if (isPwa) {
        document.body.classList.add("pwa");
        setup_pwa_modal();
    } else {
        const installApp = document.getElementById("installApp");
        const installAppIconW = document.getElementById("installAppIconWin");
        const installAppIconI = document.getElementById("installAppIconIos");
        const installAppIconA = document.getElementById("installAppIconAnd");
        if (isAndroid) {
            installAppIconA.classList.remove("hidden");
        } else if (isIphone) {
            installAppIconI.classList.remove("hidden");
        } else {
            installAppIconW.classList.remove("hidden");
        }
        console.log("install app button:", installApp);
        installApp.addEventListener("click", async () => {
            if (deferredPrompt !== null) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    deferredPrompt = null;
                }
            }
        });
    }
}

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
    button.addEventListener("click", () => {
        modal.classList.add("open");
        document.body.classList.add("modal-open");
        updateThemeColor();
    });
    const closeModal = function () {
        modal.classList.remove("open");
        document.body.classList.remove("modal-open");
        updateThemeColor();
    };
    modal.addEventListener("click", closeModal);
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
    settingsApplyButton.addEventListener("click", closeModal);
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
}
