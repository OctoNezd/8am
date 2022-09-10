import { iphone, ipad } from "./ios_modal";
let deferredPrompt;
const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
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
function bootPWA() {
    require("./pwa");
}
window.bootPWA = bootPWA;

if (isPwa) {
    bootPWA();
} else {
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
        } else if (iphone || ipad) {
            installAppIconI.classList.remove("hidden");
        } else {
            installAppIconW.classList.remove("hidden");
        }
        console.log("install app button:", installApp);
        if (!(iphone || ipad)) {
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
}
