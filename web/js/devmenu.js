import { iphone, ipad } from "./ios_modal";
import { openModal } from "./modal";
import { pwaDetectType, isPwa } from "./pwa_add";
import localForage from "localforage";
import showToast from "./toast";

function generate_sysreport() {
    const report = document.getElementById("systemReport");
    report.innerText = "Отладочная информация:";
    report.innerText += `\nPWA:${isPwa}:${pwaDetectType}`;
    report.innerText += `\niphone:${iphone},ipad:${ipad}`;
    report.innerText += `\nlocation:${location}`;
    report.innerText += `\nОтладочная информация сгенерирована: ${new Date()}`;
    localForage.getItem("lastPeriodicSync").then((lastPeriodicSync) => {
        report.innerText += `\nПоследнее авто-обновление расписания: ${lastPeriodicSync}`;
    });
}
window.generate_sysreport = generate_sysreport;
function setup_devmenu() {
    const openDevMenu = document.getElementById("openDevMenu");
    openDevMenu.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(document.getElementById("devMenu"), e);
    });
    generate_sysreport();
    document
        .getElementById("allReset")
        .addEventListener("click", () => allReset(true));
    document
        .getElementById("cleanCaches")
        .addEventListener("click", () => allReset(false));
}
setup_devmenu();
window.bootChii = function () {
    var script = document.createElement("script");
    script.src = "//chii.liriliri.io/target.js";
    document.body.appendChild(script);
    showToast("Chii запущен, откройте https://chii.liriliri.io/ в браузере");
};
async function allReset(nukeAll) {
    const modal = document.createElement("div");
    document.body.appendChild(modal);
    modal.classList.add("modal");
    openModal(modal);
    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modal.appendChild(modalBody);
    const resetHeader = document.createElement("h3");
    resetHeader.innerText = "Сброс";
    resetHeader.classList.add(
        "headline-small",
        "center",
        "on-surface-text",
        "dialog-title"
    );
    const resetLog = document.createElement("div");
    resetLog.classList.add("code");
    const reloadPageButton = document.createElement("button");
    reloadPageButton.innerText = "Перезагрузить страницу";
    reloadPageButton.classList.add(
        "button",
        "knopf",
        "primary-container",
        "block",
        "tertiary"
    );
    reloadPageButton.innerText = "Перезагрузить страницу";
    reloadPageButton.disabled = true;
    reloadPageButton.addEventListener("click", () => location.reload());
    modalBody.append(resetHeader, resetLog, reloadPageButton);
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
        await caches.delete(key);
        resetLog.innerText += `Удалён кэш: ${key}\n`;
    }
    if (nukeAll) {
        const workers = await navigator.serviceWorker.getRegistrations();
        for (const worker of workers) {
            worker.unregister();
            resetLog.innerText += `Удалён воркер: ${worker.active.scriptURL}\n`;
        }
        const idb = await indexedDB.databases();
        for (const db of idb) {
            await window.indexedDB.deleteDatabase(db.name);
            resetLog.innerText += `Удалена БД: ${db.name}\n`;
        }
    }
    resetLog.innerText += "Сброс завершён. Перезагрузите страницу.";
    reloadPageButton.disabled = false;
}
