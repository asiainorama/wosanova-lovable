
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
  handleClick?: () => void;
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
      className={`relative overflow-hidden transition-all duration-300 backdrop-blur-lg bg-gray-800/70 border-gray-600/30 shadow-xl shadow-black/20 rounded-3xl ${handleClick ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer hover:bg-gray-800/80' : ''}`}
      onClick={handleClick ? handleClick : undefined}
    >
      <div className="p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {imageLoading && (
              <Skeleton className="h-10 w-10 rounded-xl" />
            )}
            
            {!imageError ? (
              <img 
                ref={imageRef}
                src={iconUrl} 
                alt={`${app.name} icon`}
                className={`${smallerIcons ? 'h-8 w-8' : 'h-10 w-10'} object-contain rounded-xl dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            ) : (
              <AppAvatarFallback
                appName={app.name}
                className={`${smallerIcons ? 'h-8 w-8' : 'h-10 w-10'} rounded-xl`}
              />
            )}
            
            <div className="ml-3 flex-grow">
              <h3 className="font-semibold line-clamp-1 text-white">{app.name}</h3>
              <p className="text-xs text-gray-300">{app.category}</p>
            </div>
          </div>

          {app.isAI && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 rounded-full">AI</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-200 line-clamp-2 mb-3 flex-grow">
          {app.description}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs bg-gray-900 hover:bg-black text-white border-gray-800 hover:border-gray-700 rounded-lg"
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
