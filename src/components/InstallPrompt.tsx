
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
      if (installPrompt) {
        console.log("Install prompt already captured");
        setShowPrompt(true);
        return;
      }

      // If we haven't shown the prompt yet
      if (!showPrompt && sessionStorage.getItem('installPromptDismissed') !== 'true') {
        console.log(`${isiOSDevice ? 'iOS' : isMacOSDevice ? 'macOS' : isAndroidDevice ? 'Android' : 'Desktop'} detected, showing install prompt`);
        setShowPrompt(true);
      }
    };

    // Wait a bit for the beforeinstallprompt event to fire first
    setTimeout(checkInstallStatus, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installPrompt, showPrompt]);

  const handleInstall = async () => {
    console.log("Install button clicked", { 
      hasInstallPrompt: !!installPrompt, 
      isIOS, 
      isMacOS, 
      isAndroid 
    });

    if (installPrompt) {
      // This is the standard way for Chrome/Edge and other browsers that support the beforeinstallprompt
      try {
        await installPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await installPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          toast.success("¡Instalación iniciada!");
          
          // Trigger manifest installation directly
          const manifestUrl = `${window.location.origin}/manifest.json`;
          try {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = manifestUrl;
            document.head.appendChild(manifestLink);
          } catch (e) {
            console.error('Error adding manifest link:', e);
          }
          
          // Hide the prompt
          setShowPrompt(false);
        } else {
          console.log('User dismissed the install prompt');
          toast.error("Instalación cancelada");
          // Only hide for the current session
          setShowPrompt(false);
        }
        
        // Reset the prompt variable, since it can't be used again
        setInstallPrompt(null);
      } catch (e) {
        console.error('Error showing install prompt:', e);
        toast.error("Error al instalar la app");
      }
    } else if (isIOS || isMacOS) {
      // For iOS/macOS, direct users to installation and make it obvious
      toast.success("Añade esta app a tu pantalla de inicio", {
        description: "Sigue las instrucciones para instalar",
        action: {
          label: "Entendido",
          onClick: () => console.log("iOS/macOS instruction acknowledged")
        },
        duration: 10000
      });
      
      // Force manifest installation for iOS
      try {
        const manifestUrl = `${window.location.origin}/manifest.json`;
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = manifestUrl;
        document.head.appendChild(manifestLink);
        
        // Add Apple meta tags dynamically if not already present
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
          const appleCapable = document.createElement('meta');
          appleCapable.name = 'apple-mobile-web-app-capable';
          appleCapable.content = 'yes';
          document.head.appendChild(appleCapable);
        }
      } catch (e) {
        console.error('Error adding manifest link for iOS:', e);
      }
    } else if (isAndroid) {
      // Force installation on Android
      try {
        // Try to trigger installation
        const manifestUrl = `${window.location.origin}/manifest.json`;
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = manifestUrl;
        document.head.appendChild(manifestLink);
        
        toast.success("Instalando la aplicación", {
          description: "Espera mientras procesamos la instalación",
          duration: 5000
        });
        
        // Reload page to trigger manifest detection
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        console.error('Error triggering installation on Android:', e);
        toast.error("No se pudo iniciar la instalación");
      }
    } else {
      // For other browsers without beforeinstallprompt support
      try {
        // Try to force installation via manifest
        const manifestUrl = `${window.location.origin}/manifest.json`;
        
        // Add manifest link if not present
        if (!document.querySelector('link[rel="manifest"]')) {
          const manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.href = manifestUrl;
          document.head.appendChild(manifestLink);
        }
        
        toast.success("Instalando aplicación", {
          description: "La instalación iniciará en breve",
          duration: 5000
        });
        
        // Refresh to trigger manifest detection
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        console.error('Error forcing installation:', e);
        toast.error("Tu navegador no soporta la instalación directa");
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Set a session storage flag to avoid showing again in this session
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
      
      {(isIOS) && (
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Toca el botón de compartir <span className="inline-block width-4 height-4">􀈂</span> abajo en Safari</li>
            <li>Desplázate y selecciona "Añadir a pantalla de inicio"</li>
            <li>Confirma pulsando "Añadir"</li>
          </ol>
        </div>
      )}
      
      {(isMacOS) && (
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Haz clic en "Archivo" en la barra de menú de Safari</li>
            <li>Selecciona "Añadir a Dock"</li>
            <li>Confirma la instalación</li>
          </ol>
        </div>
      )}
      
      {(isAndroid) && (
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Toca los tres puntos ⋮ en Chrome</li>
            <li>Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"</li>
            <li>Confirma la instalación</li>
          </ol>
        </div>
      )}
      
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
