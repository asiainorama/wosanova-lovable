
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
  
  // Detectar móvil horizontal
  const isLandscapeMobile = window.innerWidth > window.innerHeight && window.innerWidth < 768;
  
  // Responsive icon sizes: móvil horizontal necesita iconos más pequeños
  const iconSize = isLandscapeMobile
    ? "w-7 h-7 md:w-10 md:h-10" // Even smaller icons for landscape mobile
    : smallerIcons 
      ? "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" 
      : "w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:w-20";
    
  // Responsive button sizes
  const buttonSize = isLandscapeMobile
    ? "h-3 w-3" // Smaller button for landscape mobile
    : smallerIcons 
      ? "h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:h-6" 
      : "h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7";
    
  // Responsive button icon sizes  
  const buttonIconSize = isLandscapeMobile
    ? "h-1.5 w-1.5" // Smaller icon for landscape mobile
    : smallerIcons 
      ? "h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" 
      : "h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5";

  // Determinar el color del texto según el fondo (fuerza texto oscuro para fondos claros)
  const textColorClass = isLightBackground() 
    ? "text-gray-800" 
    : "text-white dark:text-white";

  // Much faster animation delay
  const animationDelay = `${index * 15}ms`;

  return (
    <div 
      className="flex flex-col items-center cursor-pointer h-full w-full"
      onClick={handleClick}
      style={{
        gap: isLandscapeMobile ? '0.125rem' : '0.25rem', // Even smaller gap for landscape mobile
        padding: isLandscapeMobile ? '0.125rem' : '0.25rem'
      }}
    >
      <div className="relative flex-shrink-0">
        {/* Show skeleton only while loading and no error */}
        {imageLoading && !imageError && (
          <div className={`${iconSize} rounded-full overflow-hidden flex items-center justify-center`}>
            <Skeleton className={`${iconSize} rounded-full animate-pulse`} />
          </div>
        )}
        
        {/* Show image only when not loading or when there's an error (fallback) */}
        {(!imageLoading || imageError) && (
          <>
            {!imageError ? (
              <div className={`${iconSize} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-all duration-100`}>
                <img 
                  ref={imageRef}
                  src={iconUrl} 
                  alt={`${app.name} icon`}
                  className="w-full h-full object-cover dark:brightness-110 p-0 transition-opacity duration-100"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className={`${iconSize} rounded-full overflow-hidden transition-all duration-100`}>
                <AppAvatarFallback
                  appName={app.name}
                  className={`${iconSize} rounded-full`}
                />
              </div>
            )}
          </>
        )}
        
        {(showManage || onShowDetails) && (
          <Button 
            size="sm"
            variant="outline"
            className={`${buttonSize} rounded-full p-0 absolute -top-1 -right-1 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 transition-all duration-100 opacity-0 animate-fade-in`}
            onClick={handleAction}
            style={{ 
              animationDelay: `${index * 15 + 50}ms`,
              animationFillMode: 'forwards',
              animationDuration: '120ms'
            }}
          >
            <Heart 
              className={`${buttonIconSize} ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors duration-100`} 
            />
          </Button>
        )}
      </div>
      
      <h3 
        className={`font-medium text-center line-clamp-2 leading-tight ${textColorClass} transition-opacity duration-100 max-w-full break-words`}
        style={{ 
          opacity: imageLoading && !imageError ? 0.7 : 1,
          lineHeight: isLandscapeMobile ? '0.9' : '1.1',
          wordWrap: 'break-word',
          hyphens: 'auto',
          fontSize: isLandscapeMobile ? '0.6rem' : smallerIcons ? '0.75rem' : '0.875rem', // Much smaller text for landscape mobile
          minHeight: isLandscapeMobile ? '1.2rem' : 'auto', // Ensure minimum height for text
          maxHeight: isLandscapeMobile ? '1.8rem' : '2.4rem' // Limit max height to prevent overflow
        }}
      >
        {app.name}
      </h3>
    </div>
  );
};

export default HomeCard;
