// Todo App PWA Service Worker - Auto-cache folders (GitHub Pages version)
const CACHE_NAME = 'todo-app-cache-v6';
const BASE = '';

// Core files
const CORE_ASSETS = [
  `${BASE}index.html`,
  `${BASE}about.html`,
  `${BASE}edit_task.html`,
  `${BASE}add_task.html`,
];

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

const ASSETS = [
  ...CORE_ASSETS,
  ...JS_FILES.map(f => `js/${f}`),
  ...CSS_FILES.map(f => `css/${f}`),
  ...IMG_FILES.map(f => `img/${f}`),
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn('Cache fail:', url, err)
          )
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('todo-app-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const request = event.request;
    const url = new URL(request.url);

    // Only intercept same-origin & within this app
    if (url.origin !== self.location.origin) return fetch(request);

    url.search = ''; // strip query string timestamps

    const cached = await caches.match(url.toString());
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(url.toString(), response.clone());
      }
      return response;
    } catch {
      if (request.destination === 'document') {
        return caches.match('index.html');
      }
      return new Response('Offline', { status: 404 });
    }
  })());
});
