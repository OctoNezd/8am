if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
        navigator.serviceWorker.addEventListener("message", async (event) => {
            // Optional: ensure the message came from workbox-broadcast-update
            console.log(event);
            if (event.data.meta === "workbox-broadcast-update") {
                const { cacheName, updatedURL } = event.data.payload;

                // Do something with cacheName and updatedURL.
                // For example, get the cached content and update
                // the content on the page.
                const cache = await caches.open(cacheName);
                const updatedResponse = await cache.match(updatedURL);
                const updatedText = await updatedResponse.text();
                console.log("App updated!");
            }
        });
    });
}
