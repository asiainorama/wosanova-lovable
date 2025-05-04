
// Service Worker for WosaNova PWA
const CACHE_NAME = 'wosanova-v3';

// Assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/styles/app-styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.json'
];

// Additional assets to cache for iOS devices
const iosAssetsToCache = [
  '/icons/apple-touch-icon.png'
];

// Helper function for iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.MSStream);
}

// Helper function for macOS
function isMacOS() {
  return /Mac/.test(navigator.userAgent) && !isIOS();
}

// Install event - cache assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Immediately activate the service worker
  
  let assetsToCache = [...urlsToCache];
  
  // Add iOS specific assets when needed
  if (isIOS() || isMacOS()) {
    assetsToCache = [...assetsToCache, ...iosAssetsToCache];
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(assetsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('wosanova-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  
  // Immediately claim any clients
  return self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Don't interfere with Chrome DevTools
  if (event.request.url.includes('/devtools/')) {
    return;
  }
  
  // Special handling for icon requests - ensure they're always available
  if (event.request.url.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // If not found in cache, try network
          return fetch(event.request.clone())
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Cache for future use
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If network fails, return a default icon
              if (event.request.url.includes('apple-touch-icon')) {
                return caches.match('/icons/apple-touch-icon.png');
              }
              return caches.match('/icons/icon-192x192.png');
            });
        })
    );
    return;
  }
  
  // Standard fetch handling for other resources
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it can only be used once
            const responseToCache = response.clone();
            
            // Open the cache and store the response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        ).catch(() => {
          // If fetch fails (offline), try to return a fallback
          if (event.request.url.indexOf('.html') > -1 || 
              event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Handle message events (useful for communicating with the main thread)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
