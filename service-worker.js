// Todo App PWA Service Worker - Auto-cache folders, query-safe fetch
const CACHE_NAME = 'todo-app-cache-v4';
const BASE = '/todo/';

// Core files (all main pages)
const CORE_ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}about.html`,
  `${BASE}edit_task.html`,
  `${BASE}add_task.html`,
];

// Known files in each folder
const JS_FILES = [
  'brython.js',
  'brython_stdlib.js',
  'load_brython.js',
  'index.bry',
  'edit_task.bry',
  'add_task.bry',
  'about.bry',
];

const CSS_FILES = ['styles.css'];

const IMG_FILES = [
  'todo.png',
  'todo-192.png',
  'todo-512.png',
];

// Combine all assets with correct folder paths
const ASSETS = [
  ...CORE_ASSETS,
  ...JS_FILES.map(f => `${BASE}js/${f}`),
  ...CSS_FILES.map(f => `${BASE}css/${f}`),
  ...IMG_FILES.map(f => `${BASE}img/${f}`),
];

// Install: cache everything
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

// Activate: remove old Todo caches
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

// Fetch: offline-first strategy + ignore timestamps
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (!request.url.includes(BASE)) return;

  event.respondWith((async () => {
    const urlWithoutQuery = new URL(request.url);
    urlWithoutQuery.search = ''; // Remove '?ts=...' timestamps

    const cached = await caches.match(urlWithoutQuery.toString());
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(urlWithoutQuery.toString(), response.clone());
      }
      return response;
    } catch (err) {
      if (request.destination === 'document') {
        return caches.match(`${BASE}index.html`);
      }
      return new Response('Offline resource not available', {
        status: 404,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});
