
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from './AvatarFallback';

interface GridCardProps {
  app: AppData;
  favorite: boolean;
  showManage?: boolean;
  showRemove?: boolean;
  onShowDetails?: (app: AppData) => void;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ 
  app, 
  favorite, 
  showManage = false,
  showRemove = false,
  onShowDetails,
  handleAction, 
  handleClick 
}) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);

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
          <AppAvatarFallback
            appName={app.name}
            className="w-16 h-16 rounded-lg mb-2"
          />
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

export default GridCard;
