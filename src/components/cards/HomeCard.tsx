
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppLogo } from '@/hooks/useAppLogo';
import FavoriteButton from './FavoriteButton';

interface HomeCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

const HomeCard: React.FC<HomeCardProps> = ({
  app,
  favorite,
  handleAction,
  handleClick,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  deviceType = 'desktop'
}) => {
  const { imageUrl, isLoading, error } = useAppLogo(app.icon || '');
  
  // Define icon sizes based on device type
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
  
  // Define font sizes based on device type
  const getFontSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 'text-xs'; // smallest
      case 'tablet':
        return 'text-sm'; // medium
      case 'desktop':
        return 'text-base'; // largest
      default:
        return smallerIcons ? 'text-xs' : 'text-sm';
    }
  };
  
  const iconSize = getIconSize();
  const fontSize = getFontSize();

  return (
    <div
      className="flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer relative"
      onClick={handleClick}
    >
      <div className={`${iconSize} relative flex items-center justify-center mb-1 rounded-xl overflow-hidden`}>
        {isLoading ? (
          <div className={`${iconSize} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl`} />
        ) : error ? (
          <div className={`${iconSize} bg-gray-300 dark:bg-gray-700 rounded-xl flex items-center justify-center`}>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{app.name.substring(0, 1)}</span>
          </div>
        ) : (
          <img 
            src={imageUrl || app.icon} 
            alt={app.name} 
            className={`${iconSize} object-contain rounded-xl`}
          />
        )}
        
        {/* Favorite button or remove button in top right */}
        <div className="absolute -top-1 -right-1">
          <FavoriteButton 
            isFavorite={favorite} 
            onToggle={handleAction} 
            smallSize={deviceType === 'mobile'}
          />
        </div>
      </div>
      
      <span className={`${fontSize} font-medium text-center mt-1 line-clamp-2`}>
        {app.name}
      </span>
    </div>
  );
};

export default HomeCard;
