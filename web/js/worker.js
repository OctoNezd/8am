import localForage from "localforage";
import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing/registerRoute";
import { StaleWhileRevalidate } from "workbox-strategies/StaleWhileRevalidate";
import { ExpirationPlugin } from "workbox-expiration";
const wbManifest = self.__WB_MANIFEST;
console.log("wbmanifest", wbManifest);

const icsCache = new StaleWhileRevalidate({
    cacheName: "ics-cache",
    plugins: [
        new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 7,
            maxEntries: 5,
        }),
    ],
});
async function fetchAndCacheICS() {
    const gid = await localForage.getItem("last_gid");
    const serverVersion = await localForage.getItem("serverVersion");
    if ([gid, serverVersion].includes(null)) {
        console.log("Last gid/server version is not set, not syncing");
        return;
    }
    const url = `/group/${gid}.ics?sv=${serverVersion}`;
    const myCache = await caches.open("ics-cache");
    await myCache.add(new Request(url, { cache: "no-cache" }));
    await localForage.setItem("lastPeriodicSync", new Date());
    console.log(`Updated ${url}`);
}

self.addEventListener("periodicsync", (event) => {
    if (event.tag === "update-ics") {
        console.log("Fetching ics in the background!");
        event.waitUntil(fetchAndCacheICS());
    }
});

registerRoute(/\/group\/\d*\.ics/, icsCache);
try {
    precacheAndRoute(wbManifest, {
        ignoreURLParametersMatching: [/.*/],
    });
} catch {
    console.log("Corrupt cache. Nuking it.");
    caches.keys().then(async (cacheKeys) => {
        for (const key of cacheKeys) {
            await caches.delete(key);
        }
    });
}
clientsClaim();

addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
self.addEventListener("install", (e) => {
    self.skipWaiting();
});
