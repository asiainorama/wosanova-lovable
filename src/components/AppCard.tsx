import React, { useState, useEffect, useRef } from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, ImageIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';

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
  const maxRetries = 2;
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app));
  
  // Store icon URL when successfully loaded
  const storeSuccessfulIcon = () => {
    if (app.url && !imageError && iconUrl && !iconUrl.includes('placeholder')) {
      try {
        // Extract domain from the app URL
        const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
        registerSuccessfulLogo(app.id, iconUrl, domain);
      } catch (e) {
        console.warn('Failed to register successful icon:', e);
      }
    }
  };
  
  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!app.name) return '?';
    const words = app.name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return app.name.charAt(0).toUpperCase();
  };
  
  // Generate background color based on app name
  const getAvatarColor = () => {
    if (!app.name) return 'bg-gray-200 dark:bg-gray-700';
    
    // Simple hash function for consistent color
    let hash = 0;
    for (let i = 0; i < app.name.length; i++) {
      hash = app.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Choose from a set of pleasant colors
    const colors = [
      'bg-red-100 dark:bg-red-900',
      'bg-blue-100 dark:bg-blue-900',
      'bg-green-100 dark:bg-green-900',
      'bg-yellow-100 dark:bg-yellow-900',
      'bg-purple-100 dark:bg-purple-900',
      'bg-pink-100 dark:bg-pink-900',
      'bg-indigo-100 dark:bg-indigo-900',
      'bg-teal-100 dark:bg-teal-900',
      'bg-orange-100 dark:bg-orange-900',
      'bg-cyan-100 dark:bg-cyan-900'
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // On mount, check if the image is already in cache
  useEffect(() => {
    // Get logo from cache service
    const cachedLogo = getCachedLogo(app);
    setIconUrl(cachedLogo);
    
    if (cachedLogo && imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        // Image is already loaded (likely from cache)
        setImageLoading(false);
        storeSuccessfulIcon();
      }
    }
  }, [app.id]);
  
  // Function to handle favorite action
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
      toast.success(`${app.name} eliminada de favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
      });
    } else {
      addToFavorites(app);
      toast.success(`${app.name} añadida a favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
      });
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
    // If we've already retried too many times, show fallback
    if (retryCount >= maxRetries) {
      setImageError(true);
      setImageLoading(false);
      return;
    }
    
    setRetryCount(retryCount + 1);
    
    // Try different image strategies based on retry count
    if (retryCount === 0) {
      // First retry: add a cache buster
      const timestamp = new Date().getTime();
      const newUrl = iconUrl.split('?')[0] + '?' + timestamp;
      setIconUrl(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    } 
    else if (retryCount === 1) {
      // Second retry: try Google Favicon API as a fallback
      const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const newUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      setIconUrl(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    }
    else {
      // If all retries failed, show fallback
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    storeSuccessfulIcon();
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
              ref={imageRef}
              src={iconUrl} 
              alt={`${app.name} icon`}
              className={`w-12 h-12 rounded-md object-contain dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          ) : (
            <Avatar className={`w-12 h-12 rounded-md flex items-center justify-center ${getAvatarColor()}`}>
              <AvatarFallback className="text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center">
                {getInitials()}
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
            ref={imageRef}
            src={iconUrl} 
            alt={`${app.name} icon`}
            className={`w-16 h-16 object-contain app-icon dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <Avatar className={`w-16 h-16 rounded-lg ${getAvatarColor()}`}>
            <AvatarFallback className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {getInitials()}
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
      <div className="large-app-card cursor-pointer relative" onClick={handleClick}>
        <div className="h-full w-full">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          )}
          
          {!imageError ? (
            <img 
              ref={imageRef}
              src={iconUrl} 
              alt={`${app.name} icon`}
              className={`large-app-icon dark:brightness-110 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          ) : (
            <div className={`absolute inset-0 ${getAvatarColor()} rounded-lg flex items-center justify-center`}>
              <span className="text-4xl font-bold text-gray-700 dark:text-gray-300">
                {getInitials()}
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
      <div className="flex flex-col items-center">
        {imageLoading && (
          <Skeleton className="w-16 h-16 rounded-lg mb-2" />
        )}
        
        {!imageError ? (
          <img 
            ref={imageRef}
            src={iconUrl} 
            alt={`${app.name} icon`}
            className={`w-16 h-16 object-contain mb-2 app-icon dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <Avatar className={`w-16 h-16 rounded-lg mb-2 ${getAvatarColor()}`}>
            <AvatarFallback className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <h3 className="text-sm font-medium text-center dark:text-white">{app.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 text-center mt-1">{app.description}</p>
      </div>
      
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
