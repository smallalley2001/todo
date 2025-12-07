const BASE = self.registration.scope.replace(location.origin, "");
const CACHE_NAME = "gratitude-cache-v7"; // new name (correct app name)

// Pre-cache all static resources
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

// Install
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

// Fetch: Safe runtime caching
self.addEventListener("fetch", event => {
  const request = event.request;
  const noQueryURL = request.url.split("?")[0];

  event.respondWith(
    caches.match(noQueryURL, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (request.method === "GET" && response.ok) {
          try {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(noQueryURL, clone));
          } catch (err) {
            console.warn("[SW] Skip caching — response not cloneable:", noQueryURL);
          }
        }
        return response;
      }).catch(() => {
        if (request.destination === "document") {
          return caches.match(BASE + "index.html");
        }
      });
    })
  );
});
