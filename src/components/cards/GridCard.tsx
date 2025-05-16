
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppLogo } from '@/hooks/useAppLogo';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import AvatarFallback from './AvatarFallback';
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
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

const GridCard: React.FC<GridCardProps> = ({
  app,
  favorite,
  showRemove = false,
  showManage = false,
  onShowDetails,
  handleAction,
  handleClick,
  smallerIcons = false,
  deviceType = 'desktop'
}) => {
  const { imageUrl, isLoading, error } = useAppLogo(app.icon || '');
  
  // Get icon size based on device type
  const getIconSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-12 h-12'; // 48px
      case 'tablet':
        return 'w-16 h-16'; // 64px
      case 'desktop':
        return 'w-20 h-20'; // 80px
      default:
        return smallerIcons ? 'w-12 h-12' : 'w-16 h-16';
    }
  };
  
  const iconSize = getIconSize();

  return (
    <div className="catalog-grid-item group">
      <div className="relative flex flex-col items-center">
        {/* App Icon with loading states */}
        <div className="relative mb-3">
          {isLoading ? (
            <div className={`${iconSize} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl`} />
          ) : error ? (
            <div 
              className={`${iconSize} bg-gray-300 dark:bg-gray-700 rounded-xl flex items-center justify-center`}
              onClick={handleClick}
            >
              <AvatarFallback letter={app.name.substring(0, 1)} />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imageUrl || app.icon}
                alt={app.name}
                className={`${iconSize} object-contain rounded-xl cursor-pointer transition-all group-hover:scale-105`}
                onClick={handleClick}
              />
              
              {/* Favorite button */}
              <div className="absolute -top-1 -right-1">
                <FavoriteButton 
                  isFavorite={favorite} 
                  onToggle={handleAction}
                  smallSize={deviceType === 'mobile'}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* App Name */}
        <p 
          className={`font-medium text-center mb-0.5 line-clamp-2 ${deviceType === 'mobile' ? 'text-xs' : deviceType === 'tablet' ? 'text-sm' : 'text-base'}`}
          onClick={handleClick}
        >
          {app.name}
        </p>

        {/* Action buttons */}
        {showManage && onShowDetails && (
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => onShowDetails(app)}
            >
              <Info className="h-3 w-3" />
              <span className="text-xs">Detalles</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridCard;
