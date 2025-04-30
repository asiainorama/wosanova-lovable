
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/apps';
import { useLanguage } from '@/contexts/LanguageContext';

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
            <Button onClick={() => window.open(app.url, '_blank')} className="flex items-center gap-2">
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
