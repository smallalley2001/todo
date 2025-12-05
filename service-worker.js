const CACHE_NAME = 'todo-app-cache-v2'; // <-- bumped version to ensure update
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
  '/todo/img/todo.png',
  '/todo/img/todo-192.png',
  '/todo/img/todo-512.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate
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

// Fetch (ignore ? timestamps)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => response || fetch(event.request))
  );
});
