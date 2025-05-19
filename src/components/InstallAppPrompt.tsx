
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Package } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

// Interfaz para la instalación de PWAs individuales
export const useAppInstall = (appName: string, appUrl: string) => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Verificar si la app ya está instalada o si está en un entorno donde se puede instalar
    const checkInstallability = () => {
      // Si estamos en standalone mode, significa que ya está instalada
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
      
      setCanInstall(!isStandalone);
    };
    
    checkInstallability();
    
    // Re-verificar cuando cambia la visibilidad (por si el usuario instala en otra pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInstallability();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [appUrl]);

  const installApp = () => {
    try {
      // Abrir la URL como una ventana independiente
      const windowFeatures = 'width=1024,height=768,noopener,noreferrer';
      const newWindow = window.open(appUrl, '_blank', windowFeatures);
      
      if (newWindow) {
        toast.success(`Abriendo ${appName} como aplicación`, {
          description: "Guarda esta página como acceso directo para futuras visitas",
          duration: 5000
        });
      } else {
        toast.error("No se pudo abrir la aplicación", {
          description: "Tu navegador puede estar bloqueando ventanas emergentes",
        });
      }
    } catch (error) {
      console.error("Error al instalar la app:", error);
      toast.error("Hubo un problema al instalar la aplicación");
    }
  };

  return { canInstall, installApp };
};

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');

    if (isAppInstalled) {
      return; // Don't show install prompt if already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the dialog
      setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    console.log(`User ${choiceResult.outcome} the install prompt`);
    
    // Reset the deferredPrompt variable
    setDeferredPrompt(null);
    setIsOpen(false);
  };

  // Don't render anything if the app is already installed or the prompt isn't available
  if (!deferredPrompt) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Instalar WosaNova</AlertDialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogHeader>
        <AlertDialogDescription className="py-4">
          Instala WosaNova en tu dispositivo para acceder más rápido y utilizarla sin conexión.
        </AlertDialogDescription>
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
            alt="WosaNova Logo" 
            className="w-16 h-16"
          />
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full sm:w-auto">Ahora no</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="w-full sm:w-auto flex items-center gap-2" onClick={handleInstallClick}>
              <Package className="h-4 w-4" />
              Instalar aplicación
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InstallAppPrompt;
