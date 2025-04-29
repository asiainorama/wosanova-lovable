
import React, { useState } from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [imageError, setImageError] = useState(false);
  
  const handleAction = () => {
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!showManage && !onShowDetails) {
      const newWindow = window.open(
        app.url, 
        '_blank', 
        'noopener,noreferrer,width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes'
      );
      if (newWindow) newWindow.focus();
    } else if (onShowDetails) {
      onShowDetails(app);
    }
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

  // Simple card with only icon and name for the home page
  if (isHomePage) {
    return (
      <div 
        className="flex flex-col items-center gap-2 p-2 cursor-pointer transition-transform hover:-translate-y-1"
        onClick={handleClick}
      >
        {!imageError ? (
          <img 
            src={app.icon} 
            alt={`${app.name} icon`}
            className="w-16 h-16 object-contain dark:brightness-110"
            onError={handleImageError}
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              {app.name.charAt(0)}
            </span>
          </div>
        )}
        <h3 className="text-sm font-medium text-center dark:text-white">{app.name}</h3>
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant={favorite || showRemove ? "outline" : "outline"}
            className="h-8 w-8 rounded-full p-0 absolute top-0 right-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
          >
            <Heart 
              className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </Button>
        )}
      </div>
    );
  }

  if (isLarge) {
    return (
      <div className="large-app-card cursor-pointer" onClick={handleClick}>
        <div className="relative h-full w-full">
          {!imageError ? (
            <img 
              src={app.icon} 
              alt={`${app.name} icon`}
              className="large-app-icon dark:brightness-110"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                {app.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4 text-left">
            <span className="text-white text-sm font-medium mb-1">{app.category}</span>
            <h3 className="text-white font-bold text-lg">{app.name}</h3>
            <p className="text-white/80 text-sm line-clamp-2">{app.description}</p>
          </div>
        </div>
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant={favorite || showRemove ? "outline" : "outline"}
            className={`absolute top-2 right-2 h-8 w-8 rounded-full p-0 ${
              favorite || showRemove
                ? 'bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90'
                : 'bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
          >
            <Heart 
              className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </Button>
        )}

        {!(showManage || onShowDetails) && isLarge && (
          <div className="absolute right-3 bottom-3">
            <ExternalLink className="h-4 w-4 text-white/70" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center p-4 cursor-pointer transition-transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {!imageError ? (
        <img 
          src={app.icon} 
          alt={`${app.name} icon`}
          className="w-16 h-16 object-contain mb-2 dark:brightness-110"
          onError={handleImageError}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-2">
          <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            {app.name.charAt(0)}
          </span>
        </div>
      )}
      
      <h3 className="text-sm font-medium text-center dark:text-white">{app.name}</h3>
      
      {(showManage || onShowDetails) && (
        <Button 
          size="sm"
          variant={favorite || showRemove ? "outline" : "outline"}
          className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
        >
          <Heart 
            className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </Button>
      )}
    </div>
  );
};

export default AppCard;
