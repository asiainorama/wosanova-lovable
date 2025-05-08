
import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      console.log("App is already installed");
      setShowPrompt(false);
      return;
    }

    // Check platform
    const isiOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isMacOSDevice = /Mac/.test(navigator.userAgent) && !isiOSDevice;
    const isAndroidDevice = /Android/.test(navigator.userAgent);
    
    setIsIOS(isiOSDevice);
    setIsMacOS(isMacOSDevice);
    setIsAndroid(isAndroidDevice);
    
    // For Chrome, Edge, etc. (supports beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log("Install prompt captured", e);
      // Show the prompt to the user
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt based on platform if not already shown by beforeinstallprompt
    const checkInstallStatus = () => {
      if (!showPrompt && sessionStorage.getItem('installPromptDismissed') !== 'true') {
        console.log(`${isiOSDevice ? 'iOS' : isMacOSDevice ? 'macOS' : isAndroidDevice ? 'Android' : 'Desktop'} detected, showing install prompt`);
        setShowPrompt(true);
      }
    };

    // Wait a bit for the beforeinstallprompt event to fire first
    setTimeout(checkInstallStatus, 2000);

    // Also try to capture appinstalled event
    window.addEventListener('appinstalled', (event) => {
      console.log('App installed event captured', event);
      setShowPrompt(false);
      toast.success("¡Aplicación instalada correctamente!");
      
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'APP_INSTALLED'
          });
        }
      } catch (e) {
        console.error('Error sending message to service worker:', e);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showPrompt]);

  const handleInstall = async () => {
    console.log("Install button clicked", { 
      hasInstallPrompt: !!installPrompt, 
      isIOS, 
      isMacOS, 
      isAndroid 
    });

    // Forzar la instalación directamente
    try {
      // Asegurarse que el manifest esté siempre cargado
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
      }

      // Para navegadores con soporte a beforeinstallprompt
      if (installPrompt) {
        await installPrompt.prompt();
        
        const choiceResult = await installPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          toast.success("¡Instalación iniciada!");
          
          // Enviar mensaje al service worker para confirmar instalación
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'INSTALL_APP'
            });
          }
          
          // Ocultar el prompt
          setShowPrompt(false);
        } else {
          console.log('User dismissed the install prompt');
          toast.error("Instalación cancelada");
          setShowPrompt(false);
        }
        
        setInstallPrompt(null);
      } else {
        // Para dispositivos sin soporte a beforeinstallprompt
        // 1. Asegurarse que los meta tags para PWA están presentes
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
          const appleCapable = document.createElement('meta');
          appleCapable.name = 'apple-mobile-web-app-capable';
          appleCapable.content = 'yes';
          document.head.appendChild(appleCapable);
        }
        
        // 2. Forzar mensaje al service worker para iniciar instalación
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'INSTALL_APP'
          });
        }
        
        // 3. Mostrar mensaje de instalación según plataforma
        if (isIOS || isMacOS) {
          toast.success("Añade esta app a tu pantalla de inicio", {
            description: "Sigue las instrucciones para instalar",
            action: {
              label: "OK",
              onClick: () => window.location.href = "https://support.apple.com/es-es/guide/iphone/iph42ab2f3a7/ios"
            },
            duration: 10000
          });
        } else {
          toast.success("Instalando la aplicación", {
            description: "Por favor espera mientras se completa la instalación"
          });
          
          // 4. Forzar refresco después de un momento
          setTimeout(() => {
            // Actualizar el service worker
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.update();
                }
              });
            }
          }, 1000);
        }
      }
    } catch (e) {
      console.error('Error durante la instalación:', e);
      toast.error("Error al instalar. Inténtalo de nuevo.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    try {
      sessionStorage.setItem('installPromptDismissed', 'true');
    } catch (e) {
      console.error('Error setting session storage:', e);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">
          Instálate la App!
        </h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Instálate la App para disfrutar de todo su potencial.
      </p>
      
      <Button 
        onClick={handleInstall} 
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
      >
        <Download size={16} />
        <span>INSTALAR</span>
      </Button>
    </div>
  );
};

export default InstallPrompt;
