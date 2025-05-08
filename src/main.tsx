
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/app-styles.css';
import { toast } from "sonner";

// Register service worker for PWA support with better logging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Unregister any existing service workers first to ensure clean installation
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('Unregistered old service worker');
      }
      
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Bypass cache for service worker updates
      });
      
      console.log('Service worker registered successfully:', registration.scope);
      
      // Check for updates immediately and periodically
      registration.update();
      setInterval(() => registration.update(), 60 * 60 * 1000); // Check for updates every hour
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker installing:', newWorker?.state);
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service worker state changed to:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, ready to activate');
              // Notify the user about the update
              toast.info("Nueva actualización disponible. Recarga para aplicarla.", {
                action: {
                  label: "Actualizar",
                  onClick: () => window.location.reload()
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
    
    // Listen for service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed - page will reload');
      window.location.reload();
    });
    
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
