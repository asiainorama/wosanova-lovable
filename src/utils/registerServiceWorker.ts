
// Utilidad para registrar el Service Worker

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js');
      console.log('Service Worker registrado con éxito:', registration);
      
      // Configurar actualización automática del SW cuando hay una nueva versión
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.log('Nueva versión del Service Worker disponible');
              
              // Notificar al usuario sobre la actualización
              // Esta acción puede ser personalizada según necesidad
              if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Verificar periódicamente si hay actualizaciones
      setInterval(async () => {
        try {
          await registration.update();
          console.log('Service Worker: verificación de actualización');
        } catch (err) {
          console.error('Service Worker: error al verificar actualizaciones', err);
        }
      }, 60 * 60 * 1000); // Verificar cada hora
      
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  } else {
    console.log('Service Worker no soportado en este navegador');
  }
};

// Para manejar actualizaciones cuando la aplicación ya está cargada
export const listenForWaitingServiceWorker = (
  registration: ServiceWorkerRegistration,
  callback: () => void
): void => {
  function handleStateChange(): void {
    if (registration.waiting) {
      // Si hay un worker esperando, notificar
      callback();
    }
  }

  if (registration.waiting) {
    // Ya hay un worker esperando
    callback();
  }

  if (registration.installing) {
    // Hay un worker instalándose
    registration.installing.addEventListener('statechange', handleStateChange);
  }

  // Escuchar por futuros workers que se instalen
  registration.addEventListener('updatefound', () => {
    if (registration.installing) {
      registration.installing.addEventListener('statechange', handleStateChange);
    }
  });
};

// Solicitar que el worker en espera tome el control
export const skipWaiting = (): void => {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  if (navigator.serviceWorker.controller.state === 'activated') {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};
