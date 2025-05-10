
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/LanguageContext';

// Tipo para el evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useLanguage();
  
  // Comprueba si la app ya está instalada o si estamos en iOS (donde funciona diferente)
  const checkIfInstalled = () => {
    // Comprobar si ya está en modo standalone (instalada)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    // Comprobar si es iOS con PWA ya añadida a pantalla
    if (
      window.navigator.standalone === true ||
      (window as any).navigator.standalone === true
    ) {
      return true;
    }
    return false;
  };

  // Detectar iOS para mostrar instrucciones específicas
  const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  // Comprobar si es Safari en iOS
  const isIOSSafari = () => {
    const ua = window.navigator.userAgent;
    const iOS = isIOS();
    const webkit = /webkit/.test(ua.toLowerCase());
    const safari = !(/chrome|android/.test(ua.toLowerCase()));
    return iOS && webkit && safari;
  };

  useEffect(() => {
    // No mostrar banner si la app ya está instalada
    if (checkIfInstalled()) {
      return;
    }

    // Verificar si ha pasado suficiente tiempo desde la última vez que se mostró el banner
    const lastPrompt = localStorage.getItem('pwaPromptDismissed');
    const showPromptAfterDays = 7; // Mostrar de nuevo después de una semana
    
    if (lastPrompt) {
      const lastPromptDate = new Date(JSON.parse(lastPrompt));
      const daysElapsed = (new Date().getTime() - lastPromptDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysElapsed < showPromptAfterDays) {
        return;
      }
    }

    // Para navegadores modernos que soportan el evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      
      // Mostrar el banner después de 30 segundos de uso de la app
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si es iOS y mostrar instrucciones específicas después de un tiempo
    if (isIOSSafari()) {
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación de la PWA');
        setInstallPrompt(null);
      } else {
        console.log('Usuario rechazó la instalación de la PWA');
        // Guardar fecha de rechazo
        localStorage.setItem('pwaPromptDismissed', JSON.stringify(new Date()));
      }
      setShowInstallBanner(false);
      setIsOpen(false);
    }
  };

  const dismissBanner = () => {
    localStorage.setItem('pwaPromptDismissed', JSON.stringify(new Date()));
    setShowInstallBanner(false);
  };

  const openInstallModal = () => {
    setIsOpen(true);
    setShowInstallBanner(false);
  };

  // No renderizar nada si la app ya está instalada
  if (checkIfInstalled()) {
    return null;
  }

  return (
    <>
      {/* Mini banner flotante */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
          <div>
            <p className="font-medium">
              {t('pwa.installBanner') || "Añadir WosaNova a tu pantalla de inicio"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openInstallModal}>
              <Download className="h-4 w-4 mr-1" />
              {t('pwa.install') || "Instalar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissBanner}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal detallado de instalación */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('pwa.installTitle') || "Instalar WosaNova"}</DialogTitle>
            <DialogDescription>
              {t('pwa.installDesc') || "Instala WosaNova para acceso rápido y mejor experiencia"}
            </DialogDescription>
          </DialogHeader>
          
          {isIOS() ? (
            <div className="space-y-4">
              <p>{t('pwa.iosInstructions') || "Para instalar en iOS:"}</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>{t('pwa.iosTap') || "Toca"} <span className="inline-block bg-gray-200 px-2 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span> {t('pwa.iosShare') || "o"} <span className="inline-block bg-gray-200 px-2 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </span></li>
                <li>{t('pwa.iosTapAddToHome') || 'Desplázate hacia abajo y toca "Añadir a pantalla de inicio"'}</li>
                <li>{t('pwa.iosTapAdd') || 'Toca "Añadir" en la parte superior derecha'}</li>
              </ol>
              <div className="pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('pwa.understand') || "Entendido"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <img 
                src="/icons/icon-192x192.png" 
                alt="WosaNova" 
                className="w-24 h-24 rounded-xl shadow-md" 
              />
              <Button onClick={handleInstall} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {t('pwa.installNow') || "Instalar Ahora"}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('pwa.benefits') || "Acceso rápido y funciona sin conexión"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallPWA;
