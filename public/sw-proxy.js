
// PWA Proxy Service Worker - Basic Cache Implementation

const CACHE_NAME = 'wosanova-proxy-cache-v1';

// Files to cache for the proxy pages
const urlsToCache = [
  '/',
  '/index.html',
  '/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png'
];

self.addEventListener('install', (event) => {
  // Install service worker and cache core files
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Basic network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
