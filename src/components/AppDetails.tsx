
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/apps';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeOpenWindow } from '@/utils/windowUtils';

interface AppDetailsProps {
  app: AppData | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppDetails: React.FC<AppDetailsProps> = ({ app, isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!app) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={app.icon} alt={app.name} className="w-8 h-8" />
            {app.name}
          </DialogTitle>
          <DialogDescription className="pt-2">{app.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Mostrar la categoría */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoría: </span>
            <span className="text-sm dark:text-gray-300">{app.category}</span>
          </div>
          
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
