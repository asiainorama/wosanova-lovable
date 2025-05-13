
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
            <Button className="w-full sm:w-auto" onClick={handleInstallClick}>
              Instalar aplicación
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InstallAppPrompt;
