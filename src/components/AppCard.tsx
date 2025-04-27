
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Heart, X, ExternalLink } from 'lucide-react';

interface AppCardProps {
  app: AppData; 
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false
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
      // Use window.open with specific features to ensure opening in a new window
      const newWindow = window.open(
        app.url, 
        '_blank', 
        'noopener,noreferrer,width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes'
      );
      
      // Force focus on the new window
      if (newWindow) {
        newWindow.focus();
      }
    } else if (onShowDetails) {
      onShowDetails(app);
    }
  };

  const cardClass = isLarge
    ? "large-app-card"
    : "app-card";

  return (
    <div 
      className={`${cardClass} ${!showManage && !onShowDetails ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="relative h-full w-full">
        {isLarge && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4 text-left">
            <span className="text-white text-sm font-medium mb-1">{app.category}</span>
            <h3 className="text-white font-bold text-lg">{app.name}</h3>
            <p className="text-white/80 text-xs line-clamp-2">{app.description}</p>
          </div>
        )}
        
        <img 
          src={app.icon} 
          alt={`${app.name} icon`}
          className={isLarge ? "large-app-icon" : "app-icon"}
        />
        
        {!isLarge && (
          <span className="text-sm text-center font-medium truncate w-full mt-2">
            {app.name}
          </span>
        )}
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant={favorite || showRemove ? "outline" : "outline"}
            className={`absolute top-2 right-2 h-8 w-8 rounded-full p-0 ${
              favorite || showRemove
                ? 'bg-white/80 hover:bg-white/90'
                : 'bg-white/80 hover:bg-white/90'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
          >
            {showRemove ? (
              <X className="h-4 w-4 text-red-500" />
            ) : (
              <Heart 
                className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            )}
          </Button>
        )}

        {!(showManage || onShowDetails) && isLarge && (
          <div className="absolute right-3 bottom-3">
            <ExternalLink className="h-4 w-4 text-white/70" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppCard;
