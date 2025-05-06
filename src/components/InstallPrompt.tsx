import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check platform
    const isiOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isMacOSDevice = /Mac/.test(navigator.userAgent) && !isiOSDevice;
    
    setIsIOS(isiOSDevice);
    setIsMacOS(isMacOSDevice);
    
    // For Chrome, Edge, etc. (supports beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log("Install prompt captured");
      // Show the prompt to the user
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      console.log("App is already installed");
      setShowPrompt(false);
    } else {
      // For desktop browsers, we need to be more aggressive about showing the prompt
      if (!isiOSDevice && !isMacOSDevice) {
        // Show the prompt after a short delay on desktop
        setTimeout(() => {
          // Only show if we haven't captured the beforeinstallprompt event
          if (!installPrompt) {
            console.log("No install prompt event detected, showing manual prompt for desktop");
            setShowPrompt(true);
          }
        }, 3000);
      } else if (isiOSDevice || isMacOSDevice) {
        // For iOS and macOS, show a custom prompt
        setTimeout(() => {
          console.log("iOS/macOS detected, showing custom install prompt");
          setShowPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installPrompt]);

  const handleInstall = async () => {
    if (installPrompt) {
      // Show the install prompt
      try {
        await installPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await installPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Reset the prompt variable, since it can't be used again
        setInstallPrompt(null);
        setShowPrompt(false);
      } catch (e) {
        console.error('Error showing install prompt:', e);
      }
    } else if (isIOS || isMacOS) {
      // For Safari on iOS or macOS, we can't programmatically install
      // Show detailed instructions with visual cues
      
      // Keep showing instructions but can add more visual cues here
    } else {
      // For browsers where we couldn't capture the beforeinstallprompt event
      // Try alternative installation methods
      
      // For PWA-capable browsers without the beforeinstallprompt event
      if (navigator.userAgent.includes('Firefox')) {
        // Firefox-specific instructions
        alert('En Firefox: Haz clic en los tres puntos en la barra de direcciones y selecciona "Instalar sitio como aplicación"');
      } else if (navigator.userAgent.includes('Safari') && !isIOS && !isMacOS) {
        // Safari on Windows (rare)
        alert('En Safari: Selecciona "Archivo" > "Añadir a Dock"');
      } else {
        // Generic fallback - try to use the browser's install menu
        alert('Pulsa el menú de tu navegador y busca "Instalar" o "Añadir a pantalla de inicio"');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Store preference in localStorage to avoid showing again too soon
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">
          {isIOS || isMacOS ? 'Instalar WosaNova' : 'Instalar WosaNova'}
        </h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      
      {(isIOS || isMacOS) ? (
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <p className="mb-2">
            {isIOS ? 
              'Para instalar esta app en tu iPhone/iPad:' : 
              'Para instalar esta app en tu Mac:'
            }
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Toca el botón "Compartir" {isIOS ? 'abajo' : ''} en Safari</li>
            <li>Selecciona "Añadir a pantalla de inicio"</li>
            <li>Confirma pulsando "Añadir"</li>
          </ol>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Descárgate ya la App para acceder más rápido y sin depender del navegador!
        </p>
      )}
      
      <Button 
        onClick={handleInstall} 
        className="w-full flex items-center justify-center gap-2"
      >
        <Download size={16} />
        <span>{isIOS || isMacOS ? 'Entendido' : 'INSTALAR AHORA'}</span>
      </Button>
    </div>
  );
};

export default InstallPrompt;
