
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Check, Plus, X } from 'lucide-react';

interface AppCardProps {
  app: AppData;
  showRemove?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ app, showRemove = false }) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const favorite = isFavorite(app.id);
  
  const handleAction = () => {
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  return (
    <div className="app-card">
      <img 
        src={app.icon} 
        alt={`${app.name} icon`}
        className="app-icon"
      />
      <span className="text-sm text-center font-medium truncate w-full">
        {app.name}
      </span>
      <Button 
        size="sm"
        variant={favorite || showRemove ? "destructive" : "default"}
        className="mt-2 h-8 px-3"
        onClick={handleAction}
      >
        {showRemove ? (
          <X className="h-4 w-4 mr-1" />
        ) : favorite ? (
          <Check className="h-4 w-4 mr-1" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        {showRemove ? 'Quitar' : favorite ? 'Añadido' : 'Añadir'}
      </Button>
    </div>
  );
};

export default AppCard;
