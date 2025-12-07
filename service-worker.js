// Todo App PWA Service Worker
const CACHE_NAME = 'todo-app-cache-v2';
const BASE = '/todo/';

// List of assets to cache
const ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}about.html`,
  `${BASE}css/styles.css`,
  `${BASE}js/brython.js`,
  `${BASE}js/brython_stdlib.js`,
  `${BASE}js/load_brython.js`,
  `${BASE}js/index.bry`,
  `${BASE}js/edit_task.bry`,
  `${BASE}js/about.bry`,
  `${BASE}img/todo.png`,
  `${BASE}img/todo-192.png`,
  `${BASE}img/todo-512.png`
];

// Install: pre-cache all assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('Failed to cache:', url, err)
          )
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: remove only old Todo caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('todo-app-cache-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first strategy with fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle requests within Todo app scope
  if (!request.url.includes(BASE)) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        const responseClone = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseClone);
      }
      return response;
    } catch (err) {
      // Offline fallback for HTML pages
      if (request.destination === 'document') {
        return caches.match(`${BASE}index.html`);
      }
      // Offline fallback for other assets
      return new Response('Offline resource not available', {
        status: 404,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});
