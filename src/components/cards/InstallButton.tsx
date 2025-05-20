
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { AppData } from '@/data/types';

// Interfaz para el evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallButtonProps {
  app: AppData;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

const InstallButton: React.FC<InstallButtonProps> = ({ app, className, size = "sm" }) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si el navegador soporta PWA
    const isAppInstallable = 'serviceWorker' in navigator && 
                             'BeforeInstallPromptEvent' in window &&
                             window.matchMedia('(display-mode: browser)').matches;
    
    setIsInstallable(isAppInstallable);

    // Función para manejar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre el prompt automáticamente
      e.preventDefault();
      // Guardar el evento para usarlo más tarde
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Registrar el listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!installPrompt) {
      // Si no tenemos el prompt, intentemos abrir la URL en una ventana que pueda ser instalada
      const proxyUrl = `/pwa-proxy.html?appName=${encodeURIComponent(app.name)}&appUrl=${encodeURIComponent(app.url)}&appIcon=${encodeURIComponent(app.icon)}&appDescription=${encodeURIComponent(app.description)}`;
      
      window.open(proxyUrl, '_blank');
      toast.info('Abriendo página para instalar la aplicación');
      return;
    }

    // Mostrar el prompt de instalación
    try {
      installPrompt.prompt();
      // Esperar a que el usuario responda al prompt
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success(`¡${app.name} se ha instalado correctamente!`);
      } else {
        toast.info('Instalación cancelada');
      }
      
      // Clear the saved prompt, it can't be used again
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error al instalar la PWA:', error);
      toast.error('Error al instalar la aplicación');
    }
  };

  // Si la aplicación no puede ser instalada, no mostramos el botón
  if (!isInstallable) return null;

  return (
    <Button 
      size={size}
      variant="secondary"
      className={className}
      onClick={handleInstall}
    >
      <Package className="h-3 w-3 mr-1" />
      Instalar
    </Button>
  );
};

export default InstallButton;
