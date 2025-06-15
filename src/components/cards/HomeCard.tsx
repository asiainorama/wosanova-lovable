
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import { useBackground } from '@/contexts/BackgroundContext';
import AppAvatarFallback from './AvatarFallback';

interface HomeCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  index?: number;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  app, 
  favorite, 
  handleAction, 
  handleClick,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  index = 0
}) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);
  const { isLightBackground } = useBackground();
  
  // Responsive icon sizes
  const iconSize = smallerIcons 
    ? "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" 
    : "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:w-20";
    
  // Responsive button sizes
  const buttonSize = smallerIcons 
    ? "h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:h-6" 
    : "h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7";
    
  // Responsive button icon sizes  
  const buttonIconSize = smallerIcons 
    ? "h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" 
    : "h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5";

  // Determinar el color del texto según el fondo
  const textColorClass = isLightBackground() 
    ? "text-gray-800" 
    : "text-white dark:text-white";

  // Improved staggered animation delays with smoother timing
  const iconAnimationDelay = `${index * 25}ms`;
  const textAnimationDelay = `${index * 25 + 100}ms`;
  const buttonAnimationDelay = `${index * 25 + 150}ms`;

  return (
    <div 
      className="flex flex-col items-center gap-1 p-1 cursor-pointer h-full justify-start"
      onClick={handleClick}
      style={{
        minHeight: 'fit-content',
        maxWidth: '100%'
      }}
    >
      <div className="relative flex-shrink-0">
        {/* Enhanced skeleton with pulse animation */}
        {imageLoading && !imageError && (
          <div className={`${iconSize} rounded-full overflow-hidden flex items-center justify-center`}>
            <Skeleton 
              className={`${iconSize} rounded-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700`}
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }}
            />
          </div>
        )}
        
        {!imageError ? (
          <div 
            className={`${iconSize} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 transition-all duration-200 opacity-0 animate-fade-in transform translate-y-2`}
            style={{
              animationDelay: iconAnimationDelay,
              animationFillMode: 'forwards',
              animationDuration: '400ms'
            }}
          >
            <img 
              ref={imageRef}
              src={iconUrl} 
              alt={`${app.name} icon`}
              className={`w-full h-full object-cover dark:brightness-110 p-0 transition-all duration-300 ${imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </div>
        ) : (
          <div 
            className={`${iconSize} rounded-full overflow-hidden transition-all duration-200 opacity-0 animate-fade-in transform translate-y-2`}
            style={{
              animationDelay: iconAnimationDelay,
              animationFillMode: 'forwards',
              animationDuration: '400ms'
            }}
          >
            <AppAvatarFallback
              appName={app.name}
              className={`${iconSize} rounded-full`}
            />
          </div>
        )}
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant="outline"
            className={`${buttonSize} rounded-full p-0 absolute -top-1 -right-1 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 transition-all duration-200 opacity-0 animate-fade-in transform scale-75 hover:scale-90`}
            onClick={handleAction}
            style={{ 
              animationDelay: buttonAnimationDelay,
              animationFillMode: 'forwards',
              animationDuration: '300ms'
            }}
          >
            <Heart 
              className={`${buttonIconSize} ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-all duration-200`} 
            />
          </Button>
        )}
      </div>
      
      <h3 
        className={`text-xs md:text-sm lg:text-base font-medium text-center mt-1 leading-tight ${textColorClass} transition-all duration-300 flex-shrink-0 opacity-0 animate-fade-in transform translate-y-1`}
        style={{ 
          lineHeight: '1.1',
          animationDelay: textAnimationDelay,
          animationFillMode: 'forwards',
          animationDuration: '350ms',
          wordBreak: 'break-word',
          hyphens: 'auto',
          maxWidth: '100%',
          overflow: 'visible',
          whiteSpace: 'normal',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis'
        }}
      >
        {app.name}
      </h3>
    </div>
  );
};

export default HomeCard;
