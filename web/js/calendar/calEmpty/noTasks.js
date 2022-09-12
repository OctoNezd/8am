import htmlData from "/html/calEmpty/noTasks.html";
import * as doneAnimation from "/lottie/notasks.json";
import { loadAnimation } from "lottie-web";

const viewComments = {
    listWeekNow: [
        "На этой неделе больше нет",
        "Следующая неделя",
        "Прошлая неделя",
    ],
    listWeek: ["На этой неделе нет", "Следующая неделя", "Прошлая неделя"],
    listMonth: ["В этом месяце нет", "Следующий месяц", "Прошлый месяц"],
};
export default function (viewType) {
    const mainEl = document.createElement("div");
    mainEl.innerHTML = htmlData;
    const viewComment = viewComments[viewType];
    mainEl.querySelector("#noMoreOfWhat").innerText = viewComment[0];
    mainEl.querySelector("#calNext").innerText = viewComment[1];
    mainEl.querySelector("#calBack").innerText = viewComment[2];
    const noTasksAnim = loadAnimation({
        container: mainEl.querySelector("#noTasksAnim"),
        rendered: "canvas",
        loop: false,
        autoplay: true,
        animationData: doneAnimation,
    });
    noTasksAnim.goToAndPlay(0);
    return mainEl;
}
