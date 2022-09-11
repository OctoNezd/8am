import localForage from "localforage";
import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing/registerRoute";
import { StaleWhileRevalidate } from "workbox-strategies/StaleWhileRevalidate";
const wbManifest = self.__WB_MANIFEST;
console.log("wbmanifest", wbManifest);

const icsCache = new StaleWhileRevalidate({
    cacheName: "ics-cache",
    expiration: {
        maxAgeSeconds: 60 * 60 * 24 * 7,
    },
});
async function fetchAndCacheICS() {
    const gid = await localForage.getItem("last_gid");
    if (gid === null) {
        console.log("Last gid is not set, not syncing");
        return;
    }
    const url = `/group/${gid}.ics`;
    const myCache = await caches.open("ics-cache");
    await myCache.add(new Request(url, { cache: "no-cache" }));
    console.log(`Updated ${url}`);
}

self.addEventListener("periodicsync", (event) => {
    if (event.tag === "ics-update") {
        console.log("Fetching ics in the background!");
        event.waitUntil(fetchAndCacheICS());
    }
});

registerRoute(/\/group\/\d*\.ics/, icsCache);
precacheAndRoute(wbManifest, {
    ignoreURLParametersMatching: [/.*/],
});
clientsClaim();
addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
