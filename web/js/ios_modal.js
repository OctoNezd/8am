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
export default async function () {
    openModal(document.querySelector("#iosModal"));
}
