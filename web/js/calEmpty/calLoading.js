import htmlData from "/html/calEmpty/calLoading.html";
import * as animation from "/lottie/cal_load.json";
import { loadAnimation } from "lottie-web";
function setup_loading_lottie(loadingIndicator) {
    const taskLoadAnim = loadAnimation({
        container: loadingIndicator.querySelector("#loadingAnim"),
        rendered: "svg",
        loop: true,
        autoplay: true,
        animationData: animation,
    });
    var currentAnimLoop = 1;
    taskLoadAnim.addEventListener("loopComplete", () => {
        currentAnimLoop = -currentAnimLoop;
        taskLoadAnim.setDirection(currentAnimLoop);
        taskLoadAnim.goToAndPlay(
            currentAnimLoop < 0 ? taskLoadAnim.getDuration(true) : 0,
            true
        );
    });

    console.log("lottie set up ok");
}
export default function () {
    const mainEl = document.createElement("div");
    mainEl.innerHTML = htmlData;
    setup_loading_lottie(mainEl);
    return mainEl;
}
