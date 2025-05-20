
// Nombre para la caché
const CACHE_NAME = 'wosanova-cache-v1';

// Archivos a cachear inicialmente
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png',
  '/placeholder.svg',
  '/pwa-proxy.html',
  '/sw-proxy.js'
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
});

// Evento fetch - servir contenido cacheado cuando está disponible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Usar la versión cacheada si está disponible
        if (response) {
          return response;
        }
        
        // Si no está en caché, hacer la petición a la red
        return fetch(event.request).then(
          response => {
            // Si la respuesta no es válida, no hacer nada
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta porque solo se puede consumir una vez
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Solo cachear recursos de la aplicación principal
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          }
        );
      })
  );
});
