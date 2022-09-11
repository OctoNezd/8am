import htmlData from "/html/calEmpty/calError.html";
import * as animationData from "/lottie/error.json";
import { loadAnimation } from "lottie-web";

export default function (errorText) {
    const mainEl = document.createElement("div");
    mainEl.innerHTML = htmlData;
    mainEl.querySelector("#errdesc").innerText = errorText;
    const animation = loadAnimation({
        container: mainEl.querySelector(".animation"),
        rendered: "canvas",
        loop: false,
        autoplay: true,
        animationData: animationData,
    });
    animation.goToAndPlay(0);
    return mainEl;
}
