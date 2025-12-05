const BASE = self.registration.scope.replace(location.origin, "");
const CACHE_NAME = 'todo-app-cache-v7'; // bumped version

// Pre-cache all static resources
const urlsToCache = [
  BASE,
  BASE + "index.html",
  BASE + "about.html",
  BASE + "css/styles.css",
  BASE + "js/brython.js",
  BASE + "js/brython_stdlib.js",
  BASE + "js/load_brython.js",
  BASE + "js/index.bry",
  BASE + "js/edit_task.bry",
  BASE + "js/about.bry",
  BASE + "img/todo.png",
  BASE + "img/todo-192.png",
  BASE + "img/todo-512.png",
  BASE + "manifest.json"
];

// Install: pre-cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first with runtime caching + navigation fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  const urlWithoutQuery = request.url.split('?')[0].replace(location.origin, BASE);

  event.respondWith(
    caches.match(urlWithoutQuery, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Only cache GET requests with 200 OK
        if (request.method === 'GET' && response && response.status === 200) {
          const responseClone = response.clone(); // clone to avoid "body already used"
          caches.open(CACHE_NAME).then(cache => cache.put(urlWithoutQuery, responseClone));
        }
        return response;
      }).catch(() => {
        // Offline navigation fallback for HTML pages
        if (request.destination === 'document') {
          return caches.match(BASE + "index.html");
        }
      });
    })
  );
});
