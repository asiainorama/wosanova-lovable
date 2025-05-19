
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart, Package, ExternalLink } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from './AvatarFallback';

interface ListViewCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
}

const ListViewCard: React.FC<ListViewCardProps> = ({ app, favorite, handleAction, handleClick }) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);

  // Función para manejar la instalación como PWA
  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`${app.url}`, '_blank', 'width=1024,height=768,noopener,noreferrer,standalone=yes');
  };

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
          <AppAvatarFallback 
            appName={app.name} 
            className="w-12 h-12 rounded-md"
          />
        )}
        
        <div>
          <h3 className="text-lg font-medium dark:text-white">{app.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{app.description}</p>
          
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.url, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visitar
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs"
              onClick={handleInstall}
            >
              <Package className="h-3 w-3 mr-1" />
              Instalar
            </Button>
          </div>
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
};

export default ListViewCard;
