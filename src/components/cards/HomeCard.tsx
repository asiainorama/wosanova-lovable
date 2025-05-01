
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from './AvatarFallback';

interface HomeCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  app, 
  favorite, 
  handleAction, 
  handleClick,
  showManage = false,
  onShowDetails
}) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);

  return (
    <div 
      className="flex flex-col items-center gap-1 p-1 cursor-pointer transition-transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {imageLoading && (
        <Skeleton className="w-12 h-12 rounded-lg" />
      )}
      
      {!imageError ? (
        <img 
          ref={imageRef}
          src={iconUrl} 
          alt={`${app.name} icon`}
          className={`w-12 h-12 object-contain dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      ) : (
        <AppAvatarFallback
          appName={app.name}
          className="w-12 h-12 rounded-lg"
        />
      )}
      
      <h3 className="text-xs font-medium text-center dark:text-white mt-1">{app.name}</h3>
      
      {(showManage || onShowDetails) && (
        <Button 
          size="sm"
          variant="outline"
          className="h-6 w-6 rounded-full p-0 absolute top-0 right-0"
          onClick={handleAction}
        >
          <Heart 
            className={`h-3 w-3 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </Button>
      )}
    </div>
  );
};

export default HomeCard;
