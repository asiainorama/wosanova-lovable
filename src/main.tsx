
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/app-styles.css';
import { toast } from "sonner";

// Función para registrar el service worker con mejor manejo de errores
const registerServiceWorker = async () => {
  try {
    console.log('Registrando service worker...');
    
    // Forzar la actualización del service worker primero
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('Service worker anterior desregistrado');
    }
    
    // Registrar nuevo service worker con opciones mejoradas
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none', // No usar caché para actualizaciones
      type: 'module' // Usar como módulo ES para mejor compatibilidad
    });
    
    console.log('Service worker registrado correctamente:', registration.scope);
    
    // Comprobar si la app ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      console.log('Aplicación ya instalada');
      if (registration.active) {
        registration.active.postMessage({
          type: 'APP_INSTALLED'
        });
      }
    }
    
    // Escuchar actualizaciones del service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Nuevo service worker instalándose:', newWorker?.state);
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('Estado del service worker cambiado a:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nuevo service worker instalado, listo para activar');
            // Notificar al usuario sobre la actualización
            toast.info("Nueva actualización disponible", {
              action: {
                label: "Actualizar",
                onClick: () => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              },
              duration: 10000
            });
          }
          
          if (newWorker.state === 'activated') {
            console.log('Service worker activado');
            // Intentar instalar la app automáticamente si no está instalada
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone === true;
            if (!isStandalone) {
              newWorker.postMessage({
                type: 'INSTALL_APP'
              });
            }
          }
        });
      }
    });
    
    // Escuchar cambios en el controlador del service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller cambiado - la página se recargará');
    });
    
    // Escuchar mensajes del service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Mensaje del service worker:', event.data);
      
      // Manejar mensajes específicos
      if (event.data && event.data.type === 'APP_INSTALLED') {
        toast.success("¡Aplicación instalada correctamente!");
      }
      
      if (event.data && event.data.type === 'INSTALLATION_STARTED') {
        toast.loading("Instalación en proceso...", {
          duration: 3000
        });
      }
      
      if (event.data && event.data.type === 'SERVICE_WORKER_ACTIVE') {
        console.log('Service Worker activo y listo para usar');
      }
    });
    
    return registration;
  } catch (error) {
    console.error('Error al registrar el service worker:', error);
    return null;
  }
};

// Registrar service worker para soporte PWA con mejor manejo
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    
    // Añadir detector para evento 'appinstalled'
    window.addEventListener('appinstalled', (event) => {
      console.log('App instalada', event);
      toast.success("¡Aplicación instalada correctamente!");
    });
    
    // Añadir listener para beforeinstallprompt a nivel de ventana
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('Before install prompt ejecutado a nivel de ventana');
      // No prevenir comportamiento predeterminado para permitir la instalación
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
