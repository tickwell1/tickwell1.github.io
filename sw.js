/* Tickwell Service Worker - يخلي الموقع يشتغل بدون إنترنت */

const CACHE = "tickwell-v9";   // غيّر الرقم لما تعمل تحديث كبير

const CORE = [
    "./",
    "index.html",
    "dashboard.html",
    "settings.html",
    "login.html",
    "about.html",
    "how-to-use.html",
    "privacy.html",
    "contact.html",
    "style.css",
    "script.js",
    "stats.js",
    "achievements.js",
    "settings.js",
    "consent.js",
    "auth.js",
    "sync.js",
    "manifest.webmanifest",
    "brain.png",
    "brain-192.png",
    "brain-512.png",
    "apple-touch-icon.png",
    "anton-timer.woff2"
];


self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => Promise.all(CORE.map((url) => cache.add(url).catch(() => {}))))
            .then(() => self.skipWaiting())
    );
});


self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});


/* ملفات الموقع: الإنترنت الأول (عشان التحديثات تظهر فوراً) ثم النسخة المحفوظة */
async function networkFirst(request) {
    const cache = await caches.open(CACHE);

    try {
        const response = await fetch(request);

        if (response && response.ok) cache.put(request, response.clone());

        return response;
    } catch (error) {
        const hit =
            (await cache.match(request, { ignoreSearch: true })) ||
            (request.mode === "navigate" ? await cache.match("index.html") : null);

        if (hit) return hit;

        throw error;
    }
}


/* مكتبة Firebase: النسخة المحفوظة أولاً وتتحدث في الخلفية */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request);

    const network = fetch(request)
        .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());

            return response;
        })
        .catch(() => null);

    return hit || (await network) || Response.error();
}


self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(request));
    } else if (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
        event.respondWith(staleWhileRevalidate(request));
    }
});
