const CACHE_NAME = 'todo-app-cache-v4';

// Pre-cache all static resources, including Brython scripts
const urlsToCache = [
  '/todo/',
  '/todo/index.html',
  '/todo/about.html',
  '/todo/css/styles.css',
  '/todo/js/brython.js',
  '/todo/js/brython_stdlib.js',
  '/todo/js/load_brython.js',
  '/todo/js/index.bry',
  '/todo/js/edit_task.bry',
  '/todo/js/about.bry',
  // Add all other Brython scripts here to pre-cache
  '/todo/img/todo.png',
  '/todo/img/todo-192.png',
  '/todo/img/todo-512.png'
];

// Install: cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-first with runtime caching and navigation fallback
self.addEventListener('fetch', event => {
  const request = event.request;
  const urlWithoutQuery = request.url.split('?')[0];

  event.respondWith(
    caches.match(urlWithoutQuery, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      // Fetch from network and cache dynamically
      return fetch(request).then(response => {
        if (request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(urlWithoutQuery, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Offline navigation fallback for HTML pages
        if (request.destination === 'document') {
          return caches.match('/todo/index.html');
        }
      });
    })
  );
});
