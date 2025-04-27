
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/apps';

interface AppDetailsProps {
  app: AppData | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppDetails: React.FC<AppDetailsProps> = ({ app, isOpen, onClose }) => {
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
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={`https://source.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop`} 
              alt={`${app.name} screenshot`}
              className="w-full h-48 object-cover"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => window.open(app.url, '_blank')} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Abrir Aplicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppDetails;
