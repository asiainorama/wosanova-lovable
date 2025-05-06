// Service Worker for WosaNova PWA

const CACHE_NAME = 'wosanova-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/icons/icon-192x192.png',
  '/icons/apple-touch-icon.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Image-specific strategy
  if (event.request.url.includes('/app-logos/') || event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        // Return from cache if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request.clone()).then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone and cache the response
          let responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
            console.log('[Service Worker] Caching new image:', event.request.url);
          });

          return response;
        }).catch(error => {
          console.error('[Service Worker] Fetch failed:', error);
        });
      })
    );
  } else {
    // Standard cache-first strategy for other resources
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received', event);
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nueva actualización',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WosaNova', options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
