
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Check, Plus, X, ExternalLink } from 'lucide-react';

interface AppCardProps {
  app: AppData; 
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  showRemove = false,
  showManage = false,
  onShowDetails 
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const favorite = isFavorite(app.id);
  
  const handleAction = () => {
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!showManage && !onShowDetails) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } else if (onShowDetails) {
      onShowDetails(app);
    }
  };

  return (
    <div 
      className={`app-card ${!showManage && !onShowDetails ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <img 
        src={app.icon} 
        alt={`${app.name} icon`}
        className="app-icon"
      />
      <span className="text-sm text-center font-medium truncate w-full">
        {app.name}
      </span>
      {(showManage || onShowDetails) && (
        <Button 
          size="sm"
          variant={favorite || showRemove ? "destructive" : "default"}
          className="mt-2 h-8 px-3"
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
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
      )}
    </div>
  );
};

export default AppCard;
