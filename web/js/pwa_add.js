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
export default function () {
    const installApp = document.getElementById("installApp");
    const installAppIconW = document.getElementById("installAppIconWin");
    const installAppIconI = document.getElementById("installAppIconIos");
    const installAppIconA = document.getElementById("installAppIconAnd");
    addEventListener("beforeinstallprompt", (e) => {
        installApp.classList.remove("hidden");
        deferredPrompt = e;
    });
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
