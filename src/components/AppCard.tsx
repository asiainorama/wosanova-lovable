import React, { useState } from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppCardProps {
  app: AppData; 
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  listView?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  listView = false
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const favorite = isFavorite(app.id);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Function to handle favorite action
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  // Function to handle click on the card
  const handleClick = () => {
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
  
  // Function to handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    
    // If we haven't tried multiple times, attempt alternative approaches
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      
      // Try Google Favicon as last resort
      if (retryCount === 1) {
        const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        const img = new Image();
        img.onload = () => {
          setImageError(false);
          setImageLoading(false);
          app.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        };
        img.onerror = () => {
          setImageError(true);
          setImageLoading(false);
        };
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      }
    }
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // List view style card
  if (listView) {
    return (
      <div 
        className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center space-x-4">
          {imageLoading && <Skeleton className="w-12 h-12 rounded-md" />}
          
          {!imageError ? (
            <img 
              src={app.icon} 
              alt={`${app.name} icon`}
              className={`w-12 h-12 rounded-md object-contain dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <Avatar className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md">
              <AvatarFallback className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {app.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div>
            <h3 className="text-lg font-medium dark:text-white">{app.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{app.description}</p>
          </div>
        </div>

        <Button 
          size="sm"
          variant="ghost"
          className="h-10 w-10 rounded-full p-0"
          onClick={handleAction}
        >
          <Heart 
            className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </Button>
      </div>
    );
  }

  // Simple card with only icon and name for the home page
  if (isHomePage) {
    return (
      <div 
        className="flex flex-col items-center gap-2 p-2 cursor-pointer transition-transform hover:-translate-y-1"
        onClick={handleClick}
      >
        {imageLoading && (
          <Skeleton className="w-16 h-16 rounded-lg" />
        )}
        
        {!imageError ? (
          <img 
            src={app.icon} 
            alt={`${app.name} icon`}
            className={`w-16 h-16 object-contain app-icon dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <Avatar className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <AvatarFallback className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              {app.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <h3 className="text-sm font-medium text-center dark:text-white">{app.name}</h3>
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-full p-0 absolute top-0 right-0"
            onClick={handleAction}
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
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          )}
          
          {!imageError ? (
            <img 
              src={app.icon} 
              alt={`${app.name} icon`}
              className={`large-app-icon dark:brightness-110 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                {app.name.charAt(0).toUpperCase()}
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
              handleAction(e);
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

  // Grid view (standard view for catalog)
  return (
    <div 
      className="catalog-grid-item relative cursor-pointer"
      onClick={handleClick}
    >
      {imageLoading && (
        <Skeleton className="w-16 h-16 rounded-lg mb-2" />
      )}
      
      {!imageError ? (
        <img 
          src={app.icon} 
          alt={`${app.name} icon`}
          className={`w-16 h-16 object-contain mb-2 app-icon dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <Avatar className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2">
          <AvatarFallback className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            {app.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <h3 className="text-sm font-medium text-center dark:text-white">{app.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 text-center mt-1">{app.description}</p>
      
      {(showManage || onShowDetails) && (
        <Button 
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 z-10"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(e);
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
