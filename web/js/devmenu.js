import { iphone, ipad } from "./ios_modal";
import { openModal } from "./modal";
import { pwaDetectType, isPwa } from "./pwa_add";
import showToast from "./toast";
function generate_system_report() {
    const report = document.getElementById("sysInfo");
    report.innerText = pwaDetectType;
    if (__IS_DEV__) {
        report.innerText += `\niphone:${iphone},ipad:${ipad}`;
    }
    report.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(document.getElementById("devMenu"), e);
    });
    document.getElementById("allReset").addEventListener("click", allReset);
}
generate_system_report();
async function allReset() {
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
    const workers = await navigator.serviceWorker.getRegistrations();
    for (const worker of workers) {
        worker.unregister();
        resetLog.innerText += `Удалён воркер: ${worker.active.scriptURL}\n`;
    }
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
        await caches.delete(key);
        resetLog.innerText += `Удалён кэш: ${key}\n`;
    }
    const idb = await indexedDB.databases();
    for (const db of idb) {
        await window.indexedDB.deleteDatabase(db.name);
        resetLog.innerText += `Удалена БД: ${db.name}\n`;
    }
    resetLog.innerText += "Сброс завершён. Перезагрузите страницу.";
    reloadPageButton.disabled = false;
}
