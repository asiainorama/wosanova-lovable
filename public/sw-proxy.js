
// Nombre para la caché
const CACHE_NAME = 'wosanova-pwa-proxy-cache-v1';

// Archivos a cachear inicialmente
const urlsToCache = [
  '/',
  '/index.html',
  '/pwa-proxy.html',
  '/placeholder.svg'
];

// Evento de instalación - preparar la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierta');
        return cache.addAll(urlsToCache);
      })
  );
  // Activar inmediatamente sin esperar a que se cierren las pestañas
  self.skipWaiting();
});

// Evento de activación - limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Reclamar el control inmediatamente
  self.clients.claim();
});

// Evento fetch - responder con recursos de la caché cuando sea posible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver la respuesta cacheada si existe
        if (response) {
          return response;
        }
        
        // Si no está en caché, hacer la petición a la red
        return fetch(event.request).then(
          response => {
            // Verificar si recibimos una respuesta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta porque se consume al leerla
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Añadir la respuesta a la caché para futuras solicitudes
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});
