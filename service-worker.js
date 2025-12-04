const CACHE_NAME = 'todo-app-cache-v1';
const urlsToCache = [
  '/smallalley2001/',
  '/smallalley2001/index.html',
  '/smallalley2001/about.html',
  '/smallalley2001/css/styles.css',
  '/smallalley2001/js/brython.js',
  '/smallalley2001/js/brython_stdlib.js',
  '/smallalley2001/js/load_brython.js',
  '/smallalley2001/js/index.bry',
  '/smallalley2001/js/edit_task.bry',
  '/smallalley2001/js/about.bry',
  '/smallalley2001/img/todo.png',
  '/smallalley2001/img/todo-192.png',
  '/smallalley2001/img/todo-512.png'
];

// Install Service Worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate Service Worker
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
});

// Fetch cached content first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
