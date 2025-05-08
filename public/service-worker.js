
// Service Worker for WosaNova PWA

const CACHE_NAME = 'wosanova-cache-v3'; // Versión actualizada del caché
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
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
      // Force install even if caching fails for some items
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
        // Continue installing even with errors
        return;
      })
  );
  // Skip waiting to install immediately
  self.skipWaiting();
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
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network with improved strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests to increase performance
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('new.wosanova.com')) {
    
    // Handle app logo requests with network-first, cache fallback strategy
    if (event.request.url.includes('/app-logos/') || 
        event.request.destination === 'image' || 
        event.request.url.includes('supabase.co')) {
      
      event.respondWith(
        fetch(event.request.clone())
          .then(response => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // If network fails, try from cache
            return caches.match(event.request).then(cachedResponse => {
              return cachedResponse || Promise.reject('Failed to fetch and no cache available');
            });
          })
      );
    } else {
      // For other assets use cache-first strategy
      event.respondWith(
        caches.match(event.request).then(response => {
          if (response) {
            return response; // Cache hit
          }
          
          // Cache miss, fetch from network
          return fetch(event.request.clone())
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Cache the response for future
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });

              return response;
            });
        })
      );
    }
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
    body: data.body || 'Nueva actualización disponible',
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
