
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/apps';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface AppDetailsProps {
  app: AppData | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppDetails: React.FC<AppDetailsProps> = ({ app, isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!app) return null;

  // Enhanced window opening function with error handling
  const safeOpenWindow = (url: string) => {
    try {
      // Try to open a new window with full features
      const newWindow = window.open(
        url, 
        '_blank', 
        'noopener,noreferrer,width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes'
      );
      
      // If the window is null, it might be blocked by popup blockers
      if (!newWindow) {
        console.warn('Window opening was blocked or failed');
        // Fallback - try simple _blank approach
        const fallbackWindow = window.open(url, '_blank');
        
        if (!fallbackWindow) {
          // Both attempts failed, notify the user
          toast.error('No se pudo abrir la aplicación. Por favor, permita ventanas emergentes para este sitio.', {
            className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
          });
          
          // Last resort - change current window location
          if (confirm('¿Quieres abrir la aplicación en esta ventana?')) {
            window.location.href = url;
          }
        } else {
          // Focus the fallback window
          fallbackWindow.focus();
        }
      } else {
        // Focus the new window if successfully opened
        newWindow.focus();
      }
    } catch (error) {
      console.error('Error opening window:', error);
      toast.error('Error al abrir la aplicación', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={app.icon} alt={app.name} className="w-8 h-8" />
            {app.name}
          </DialogTitle>
          <DialogDescription className="pt-2">{app.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex justify-end">
            <Button onClick={() => safeOpenWindow(app.url)} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {t('app.preview') || "Previsualizar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppDetails;
