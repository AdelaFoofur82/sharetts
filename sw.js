// Service Worker mínimo para que la PWA sea instalable
const CACHE = 'sharetts-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Ignorar peticiones que no sean GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // Cachear solo recursos del mismo origen
        if (e.request.url.startsWith(self.location.origin)) {
          const copia = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copia)).catch(() => {});
        }
        return response;
      }).catch(() => cached);
    })
  );
});