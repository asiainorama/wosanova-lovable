
import React from 'react';
import { AppData } from '@/data/apps';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from './AvatarFallback';
import FavoriteButton from './FavoriteButton';

interface GridCardProps {
  app: AppData;
  favorite: boolean;
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
  smallerIcons?: boolean;
}

const GridCard: React.FC<GridCardProps> = ({ 
  app, 
  favorite, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  handleAction, 
  handleClick,
  smallerIcons = false
}) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);
  
  return (
    <Card 
      className="relative overflow-hidden hover:shadow-md transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {imageLoading && (
              <Skeleton className="h-10 w-10 rounded-md" />
            )}
            
            {!imageError ? (
              <img 
                ref={imageRef}
                src={iconUrl} 
                alt={`${app.name} icon`}
                className={`${smallerIcons ? 'h-8 w-8' : 'h-10 w-10'} object-contain rounded-md dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            ) : (
              <AppAvatarFallback
                appName={app.name}
                className={`${smallerIcons ? 'h-8 w-8' : 'h-10 w-10'} rounded-md`}
              />
            )}
            
            <div className="ml-3 flex-grow">
              <h3 className="font-medium line-clamp-1 dark:text-white">{app.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{app.category}</p>
            </div>
          </div>

          {app.isAI && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">AI</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2 flex-grow">
          {app.description}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.open(app.url, "_blank");
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visitar
          </Button>
          
          <FavoriteButton
            favorite={favorite}
            showRemove={showRemove}
            onClick={handleAction}
          />
        </div>
      </div>
    </Card>
  );
};

export default GridCard;
