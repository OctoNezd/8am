import { openModal } from "./modal";
const iphone =
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPod");
const ipad =
    ["iPad Simulator", "iPad"].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
export { iphone, ipad };
if (iphone) {
    document.body.classList.add("iphone");
} else if (ipad) {
    document.body.classList.add("ipad");
}

if (iphone || ipad) {
    import("/html/ios_modal.html").then((html) => {
        console.log("ios html:", html.default, typeof html.default);
        document.body.insertAdjacentHTML("beforeend", html.default);
        // document.body.appendChild();
        console.log("[iOS Modal] - loaded HTML in");
        import("/css/ios.css");
        document.querySelector("#installApp").addEventListener("click", () => {
            console.log("ios modal requested");
            const modal = document.querySelector("#iosModal");
            console.log("ios modal already loaded");
            openModal(modal);
        });
    });
}
