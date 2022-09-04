let deferredPrompt;
const metaThemeColor = document.querySelector('meta[name="theme-color"]');
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
function hexToRGB(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 1];
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function getBgColor() {
    let bgcolor;
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        bgcolor = "#303030";
    } else {
        bgcolor = "#ffffff";
    }
    if (document.querySelector(".modal.open") !== null) {
        var base = hexToRGB(bgcolor);
        var added = [0, 0, 0, 0.4];

        var mix = [];
        mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round(
            (added[0] * added[3]) / mix[3] +
                (base[0] * base[3] * (1 - added[3])) / mix[3]
        ); // red
        mix[1] = Math.round(
            (added[1] * added[3]) / mix[3] +
                (base[1] * base[3] * (1 - added[3])) / mix[3]
        ); // green
        mix[2] = Math.round(
            (added[2] * added[3]) / mix[3] +
                (base[2] * base[3] * (1 - added[3])) / mix[3]
        ); // blue
        mix = mix.slice(undefined, 3);
        console.log("new rgb", mix);
        bgcolor = rgbToHex(...mix);
    }
    return bgcolor;
}

function updateThemeColor() {
    metaThemeColor.setAttribute("content", getBgColor());
}

window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateThemeColor);
updateThemeColor();
