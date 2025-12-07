// Base path — always correct for GitHub Pages subfolder PWAs
const BASE = new URL("./", self.location).pathname;

// Update version when deploying changes to force cache refresh
const CACHE_NAME = "gratitude-cache-v8";

// Static resources to pre-cache
const urlsToCache = [
  BASE,
  BASE + "index.html",
  BASE + "about.html",
  BASE + "entries.html",
  BASE + "print.html",
  BASE + "printout.html",
  BASE + "settings.html",
  BASE + "css/styles.css",
  BASE + "js/brython.js",
  BASE + "js/brython_stdlib.js",
  BASE + "js/load_brython.js",
  BASE + "js/gratitude_journal_page_1.bry",
  BASE + "js/gratitude_journal_page_2.bry",
  BASE + "js/gratitude_journal_page_3.bry",
  BASE + "js/gratitude_journal_page_4.bry",
  BASE + "js/gratitude_journal_page_5.bry",
  BASE + "js/gratitude_journal_page_6.bry",
  BASE + "img/gratitude_journal.png",
  BASE + "img/gratitude_journal_192.png",
  BASE + "img/gratitude_journal_512.png",
  BASE + "manifest.json"
];

// Install – cache all static assets up front
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate – remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
  self.clients.claim();
});

// Fetch – offline-first strategy + safe runtime caching
self.addEventListener("fetch", event => {
  const request = event.request;
  const reqURL = new URL(request.url);

  // Normalize URL (remove origin & query)
  const cleanPath = reqURL.pathname.replace(self.registration.scope, BASE);

  event.respondWith(
    caches.match(cleanPath, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          if (request.method === "GET" && response.ok) {
            const clone = response.clone(); // safe clone
            caches.open(CACHE_NAME).then(cache => {
              cache.put(cleanPath, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback only for navigation requests (HTML)
          if (request.mode === "navigate") {
            return caches.match(BASE + "index.html");
          }
        });
    })
  );
});
