
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/app-styles.css';

// Register service worker for PWA support with better logging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
      
    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
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
