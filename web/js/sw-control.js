import { Workbox } from "workbox-window";
import showToast from "./toast";
const wb = new Workbox("/sw.js");
const showSkipWaitingPrompt = async (event) => {
    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
    wb.addEventListener("controlling", () => {
        // At this point, reloading will ensure that the current
        // tab is loaded under the control of the new service worker.
        // Depending on your web app, you may want to auto-save or
        // persist transient state before triggering the reload.
        window.location.reload();
    });

    // When `event.wasWaitingBeforeRegister` is true, a previously
    // updated service worker is still waiting.
    // You may want to customize the UI prompt accordingly.

    // This code assumes your app has a promptForUpdate() method,
    // which returns true if the user wants to update.
    // Implementing this is app-specific; some examples are:
    // https://open-ui.org/components/alert.research or
    // https://open-ui.org/components/toast.research
    showToast(
        "Приложение было обновлено. Для завершения обновления нажмите на кнопку обновить.",
        10000,
        {
            buttonText: "Обновить",
            buttonCb: () => {
                caches.keys().then((cacheNames) => {
                    for (let name of cacheNames) {
                        caches.delete(name);
                    }
                });
                wb.messageSkipWaiting();
            },
            width: "80vw",
        }
    );
};
wb.addEventListener("waiting", (event) => {
    showSkipWaitingPrompt(event);
});
wb.register().then(async (registration) => {
    if ("periodicSync" in registration) {
        const status = await navigator.permissions.query({
            name: "periodic-background-sync",
        });

        console.log(
            "Periodic sync status:",
            status,
            "Worker status:",
            registration
        );
        if (status.state === "granted") {
            try {
                await registration.periodicSync.register("update-ics", {
                    minInterval: 1000 * 60 * 60 * 6,
                });
                console.log("Registered update-ics");
            } catch (e) {
                console.error("Failed to register update-ics", e);
            }
        }
    }
});
