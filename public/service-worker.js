
// Service Worker for WosaNova PWA

const CACHE_NAME = 'wosanova-cache-v5'; // Updated cache version
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

// Install event - cache app shell y registrar activamente
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[Service Worker] App Shell Cached Successfully');
        // Notificar a los clientes
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'INSTALLATION_STARTED'
            });
          });
        });
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
  // Force skip waiting to install immediately
  self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
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
    .then(() => {
      console.log('[Service Worker] Service Worker Activated');
      // Claim clients to ensure control
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network with improved strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests to increase performance
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('new.wosanova.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Cache hit - return the cached response
            return response;
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
            })
            .catch((error) => {
              console.error('[Service Worker] Fetch failed:', error);
              // Return offline page or cached version
              if (event.request.mode === 'navigate') {
                return caches.match('/');
              }
              return new Response('Network error happened', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
        })
    );
  }
});

// Escuchar mensajes de la aplicación principal
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  // Gestionar distintos tipos de mensajes
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'INSTALL_APP') {
    console.log('[Service Worker] Install app request received');
    
    // Notificar a todos los clientes
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'INSTALLATION_STARTED'
        });
      });
    });
    
    // Intentar forzar la instalación
    self.registration.showNotification('WosaNova', {
      body: 'Instalando aplicación...',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png'
    }).catch(err => console.log('No permission for notification', err));
  }
  
  if (event.data && event.data.type === 'APP_INSTALLED') {
    console.log('[Service Worker] App installation confirmed');
    
    // Notificar a todos los clientes
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'APP_INSTALLED_CONFIRMED'
        });
      });
    });
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

// Add appinstalled event listener
self.addEventListener('appinstalled', (event) => {
  console.log('[Service Worker] App was installed', event);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_INSTALLED'
      });
    });
  });
});
