
// Service Worker para WosaNova PWA
// Versión actualizada: v6 - Mejora de la instalación

const CACHE_NAME = 'wosanova-cache-v6';
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

// Evento de instalación - cachea el app shell y registra activamente
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando App Shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[Service Worker] App Shell Cacheado Exitosamente');
        // Forzar reclamo de clientes inmediatamente
        return self.clients.claim();
      })
      .then(() => {
        // Notificar a los clientes que la instalación ha empezado
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'INSTALLATION_STARTED'
            });
          });
        });
      })
      .catch(error => {
        console.error('[Service Worker] Error en la instalación del cache:', error);
      })
  );
  // Forzar skipWaiting para instalar inmediatamente
  self.skipWaiting();
});

// Evento de activación - limpia caches antiguos y reclama clientes
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando Service Worker...', event);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Eliminando cache antiguo', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Service Worker Activado');
      // Reclamar clientes para asegurar el control
      return self.clients.claim();
    })
    .then(() => {
      // Notificar a los clientes que el SW está activo
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SERVICE_WORKER_ACTIVE'
          });
        });
      });
    })
  );
});

// Evento de fetch - sirve desde cache o red con estrategia mejorada
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes del mismo origen o de nuestro dominio específico
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('new.wosanova.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Cache hit - retornar la respuesta cacheada
            return response;
          }
          
          // Cache miss, buscar en la red
          return fetch(event.request.clone())
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }

              // Cachear la respuesta para el futuro
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });

              return networkResponse;
            })
            .catch((error) => {
              console.error('[Service Worker] Error de fetch:', error);
              // Retornar página offline o versión cacheada
              if (event.request.mode === 'navigate') {
                return caches.match('/');
              }
              return new Response('Error de red', {
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
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  // Gestionar distintos tipos de mensajes
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'INSTALL_APP') {
    console.log('[Service Worker] Solicitud de instalación recibida');
    
    // Registrar la aplicación como instalable
    self.registration.showNotification('WosaNova', {
      body: 'Instalando aplicación...',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'install-notification'
    }).catch(err => console.log('Sin permiso para notificaciones', err));
    
    // Notificar a todos los clientes sobre la instalación
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'INSTALLATION_STARTED'
        });
      });
    });
    
    // Forzar la actualización para disparar los eventos de instalación del navegador
    self.registration.update();
  }
  
  if (event.data && event.data.type === 'APP_INSTALLED') {
    console.log('[Service Worker] Instalación confirmada');
    
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

// Evento de notificación push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido', event);
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nueva actualización disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore', 
        title: 'Abrir app'
      },
      {
        action: 'close', 
        title: 'Cerrar'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WosaNova', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click en notificación', event);
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Evento appinstalled
self.addEventListener('appinstalled', (event) => {
  console.log('[Service Worker] App instalada', event);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_INSTALLED'
      });
    });
  });
});

// Evento periodicsync para actualizar en segundo plano
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    console.log('[Service Worker] Sync periódica para actualizar cache');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(APP_SHELL);
      })
    );
  }
});
