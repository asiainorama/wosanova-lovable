
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
        <AppAvatarFallback
          appName={app.name}
          className="w-16 h-16 rounded-lg"
        />
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
};

export default HomeCard;
