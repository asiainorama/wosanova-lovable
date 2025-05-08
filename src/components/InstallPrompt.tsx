
import React, { useState, useEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/sonner";

// Definir correctamente la interfaz para BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  // Verificar si la app ya está instalada o si debe mostrarse el prompt
  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      console.log("App is already installed");
      setShowPrompt(false);
      return;
    }

    // Detectar plataforma
    const isiOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /Android/.test(navigator.userAgent);
    
    setIsIOS(isiOSDevice);
    setIsAndroid(isAndroidDevice);
    
    // Capturar evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Guardar el evento para usarlo después
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log("Install prompt captured", e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Si no se ha disparado el beforeinstallprompt después de un tiempo, mostrar prompt para iOS/Android/etc
    const timer = setTimeout(() => {
      if (!showPrompt && sessionStorage.getItem('installPromptDismissed') !== 'true') {
        setShowPrompt(true);
        console.log("Showing install prompt by timeout");
      }
    }, 2000);

    // Capturar evento appinstalled
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setShowPrompt(false);
      toast.success("¡Aplicación instalada correctamente!");
      
      // Notificar al service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'APP_INSTALLED'
        });
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [showPrompt]);

  const handleInstall = async () => {
    console.log("Install button clicked", { 
      hasInstallPrompt: !!installPrompt || !!deferredPrompt.current, 
      isIOS, 
      isAndroid 
    });

    try {
      // Si tenemos el evento beforeinstallprompt guardado
      if (deferredPrompt.current) {
        await deferredPrompt.current.prompt();
        const choiceResult = await deferredPrompt.current.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó la instalación');
          toast.success("¡Instalación iniciada!");
          setShowPrompt(false);
        } else {
          console.log('Usuario rechazó la instalación');
          toast.error("Instalación cancelada");
          setShowPrompt(false);
        }
        
        // Limpiar el evento guardado
        deferredPrompt.current = null;
        setInstallPrompt(null);
        return;
      }
      
      // Para iOS: Mostrar instrucciones específicas
      if (isIOS) {
        // Forzar carga del manifest
        if (!document.querySelector('link[rel="manifest"]')) {
          const manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.href = '/manifest.json?v=' + Date.now(); // Evitar caché
          document.head.appendChild(manifestLink);
        }
        
        // Asegurarse que los meta tags para PWA en iOS estén presentes
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
          const appleCapable = document.createElement('meta');
          appleCapable.name = 'apple-mobile-web-app-capable';
          appleCapable.content = 'yes';
          document.head.appendChild(appleCapable);
        }
        
        // Mostrar instrucciones para iOS con el botón de compartir
        toast.success("Para instalar en iOS", {
          description: "Toca el botón compartir y luego 'Añadir a pantalla de inicio'",
          duration: 10000,
          action: {
            label: "Entendido",
            onClick: () => setShowPrompt(false)
          }
        });
      } 
      // Para Android/otros: Intentar instalación directa vía service worker
      else {
        // Notificar al service worker para iniciar instalación
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          toast.loading("Iniciando instalación...", { duration: 3000 });
          
          navigator.serviceWorker.controller.postMessage({
            type: 'INSTALL_APP'
          });
          
          // Forzar actualización del service worker
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.update();
          }
          
          // Mostrar notificación para que el usuario sepa que debe seguir las instrucciones
          if (isAndroid) {
            toast.success("Sigue las instrucciones de instalación en tu dispositivo", {
              duration: 5000
            });
          } else {
            toast.success("Instalando aplicación...", {
              description: "Sigue las instrucciones en tu navegador",
              duration: 5000
            });
          }
        } else {
          // Si no hay service worker, mostrar mensaje genérico
          toast.error("Tu navegador no soporta la instalación directa", {
            description: "Intenta con Chrome, Edge o Safari",
            duration: 5000
          });
        }
      }
    } catch (e) {
      console.error('Error durante la instalación:', e);
      toast.error("Error al instalar. Intenta nuevamente.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
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
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {isIOS ? 'Instala esta app en tu iPhone o iPad para usarla sin conexión.' : 
         'Instálate la App para disfrutar de todo su potencial.'}
      </p>
      
      <Button 
        onClick={handleInstall} 
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
      >
        <Download size={16} />
        <span>INSTALAR AHORA</span>
      </Button>
    </div>
  );
};

export default InstallPrompt;
