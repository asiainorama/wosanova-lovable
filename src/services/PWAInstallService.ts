
import { AppData } from '@/data/apps';
import { toast } from 'sonner';

// Interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Store install prompts for different apps
const installPrompts = new Map<string, BeforeInstallPromptEvent>();

// Function to create a dynamic manifest for an app
const createDynamicManifest = (app: AppData): string => {
  const manifestObj = {
    name: app.name,
    short_name: app.name.length > 12 ? app.name.substring(0, 12) + '...' : app.name,
    description: app.description || `Acceso directo a ${app.name}`,
    start_url: app.url,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1f2937',
    icons: [
      {
        src: app.icon || '/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: app.icon || '/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  
  return JSON.stringify(manifestObj, null, 2);
}

// Create a proxy HTML for PWA installation
const createProxyHTML = (app: AppData): string => {
  const manifest = createDynamicManifest(app);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  <link rel="manifest" id="dynamicManifest">
  <meta name="theme-color" content="#1f2937">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f9fafb;
      color: #1f2937;
      text-align: center;
      padding: 1rem;
    }
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 20%;
      margin-bottom: 1.5rem;
      object-fit: contain;
      background-color: #fff;
      padding: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    p {
      margin-bottom: 1.5rem;
      color: #6b7280;
    }
    .btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #111827;
        color: #f9fafb;
      }
      p {
        color: #9ca3af;
      }
      .logo {
        background-color: #1f2937;
      }
    }
  </style>
</head>
<body>
  <img src="${app.icon || '/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png'}" class="logo" alt="${app.name} logo">
  <h1>${app.name}</h1>
  <p>${app.description || `Instala ${app.name} como aplicación`}</p>
  <button class="btn" id="installBtn">Instalar aplicación</button>
  <button class="btn" id="openBtn" style="margin-top: 10px; background-color: #4b5563;">Abrir en navegador</button>

  <script>
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw-proxy.js')
          .then(reg => console.log('Service Worker registrado'))
          .catch(err => console.error('Error al registrar Service Worker:', err));
      });
    }
    
    // Create and set dynamic manifest
    const manifestBlob = new Blob(['${manifest.replace(/"/g, '\\"').replace(/\n/g, '\\n')}'], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(manifestBlob);
    document.querySelector('#dynamicManifest').setAttribute('href', manifestURL);
    
    // Handle installation
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('installBtn').style.display = 'block';
    });
    
    document.getElementById('installBtn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User installation choice:', outcome);
        if (outcome === 'accepted') {
          console.log('App installed');
        }
        deferredPrompt = null;
      } else {
        alert('Esta aplicación ya está instalada o no se puede instalar en este navegador');
      }
    });
    
    document.getElementById('openBtn').addEventListener('click', () => {
      window.location.href = '${app.url}';
    });

    // If app is already installed or can't be installed, redirect after 3 seconds
    setTimeout(() => {
      if (!deferredPrompt) {
        window.location.href = '${app.url}';
      }
    }, 3000);
  </script>
</body>
</html>
  `;
}

// Function to install a PWA
export const installPWA = async (app: AppData): Promise<void> => {
  // Create a blob with the HTML content
  const htmlContent = createProxyHTML(app);
  const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
  const proxyUrl = URL.createObjectURL(htmlBlob);
  
  // Open the proxy page in a new window
  const newWindow = window.open(proxyUrl, '_blank');
  
  // Fallback if popup is blocked
  if (!newWindow) {
    toast.error('No se pudo abrir la ventana para instalar la aplicación. Por favor, comprueba si el navegador está bloqueando ventanas emergentes.', {
      className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
    });
  }
};

// Check if the app can be installed as PWA
export const isPWAInstallable = (): boolean => {
  // Check if the browser supports service workers
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  // Check if the browser is in standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false;
  }

  return true;
};

// Export the service
export default {
  installPWA,
  isPWAInstallable
};
