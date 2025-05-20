
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from './AvatarFallback';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  app, 
  favorite, 
  handleAction, 
  handleClick,
  showManage = false,
  onShowDetails,
  smallerIcons = false
}) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);
  
  const iconSize = smallerIcons ? "w-10 h-10" : "w-12 h-12";
  const buttonSize = smallerIcons ? "h-5 w-5" : "h-6 w-6";
  const buttonIconSize = smallerIcons ? "h-2.5 w-2.5" : "h-3 w-3";
  
  return (
    <div 
      className="flex flex-col items-center gap-1 p-1 cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="relative">
        {imageLoading && (
          <Skeleton className={`${iconSize} rounded-full`} />
        )}
        
        {!imageError ? (
          <div className={`${iconSize} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600`}>
            <img 
              ref={imageRef}
              src={iconUrl} 
              alt={`${app.name} icon`}
              className="w-full h-full object-cover dark:brightness-110 p-0"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`${iconSize} rounded-full overflow-hidden`}>
            <AppAvatarFallback
              appName={app.name}
              className={`${iconSize} rounded-full`}
            />
          </div>
        )}
        
        <div className="absolute -top-1 -right-1 flex flex-col gap-1">
          {(showManage || onShowDetails) && (
            <Button 
              size="sm"
              variant="outline"
              className={cn(
                buttonSize,
                "rounded-full p-0 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
              )}
              onClick={handleAction}
            >
              <Heart 
                className={`${buttonIconSize} ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
          )}
        </div>
      </div>
      
      <h3 className="text-xs font-medium text-center dark:text-white mt-1 line-clamp-2">{app.name}</h3>
    </div>
  );
};

export default HomeCard;
