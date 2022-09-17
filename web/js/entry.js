import showToast from "./toast";
window.onerror = function (e) {
    showToast(`Произошла ошибка: ${e}`, 10000, {
        width: "90vw",
        buttonCb: async function () {
            const cacheKeys = await caches.keys();
            for (const key of cacheKeys) {
                await caches.delete(key);
            }
            location.reload();
        },
        buttonText: "Очистить кэши",
    });
};
import "./sw-control";
import indexhtml from "html/index.html";
document.body.innerHTML = indexhtml;
import indexcss from "/css/index.css";
indexcss.use();
import "./modal";
window.__IS_DEV__ = __IS_DEV__;
require("./sharaga");
document.body.classList.add("booted");
