import React from 'react';
import { AppData } from '@/data/apps';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AvatarFallback, { getInitials, getAvatarColor } from './AvatarFallback';

interface LargeCardProps {
  app: AppData;
  favorite: boolean;
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
}

const LargeCard: React.FC<LargeCardProps> = ({ 
  app, 
  favorite, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  handleAction, 
  handleClick 
}) => {
  const { imageUrl, isLoading, error } = useAppLogo(app);

  return (
    <div className="large-app-card cursor-pointer relative" onClick={handleClick}>
      <div className="h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        )}
        
        {!error ? (
          <img 
            src={imageUrl} 
            alt={`${app.name} icon`}
            className={`large-app-icon dark:brightness-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 ${getAvatarColor(app.name)} rounded-lg flex items-center justify-center`}>
            <span className="text-4xl font-bold text-gray-700 dark:text-gray-300">
              {getInitials(app.name)}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4 text-left">
          <span className="text-white text-sm font-medium mb-1">{app.category}</span>
          <h3 className="text-white font-bold text-lg">{app.name}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{app.description}</p>
        </div>
      </div>
      
      {(showManage || onShowDetails) && (
        <Button 
          size="sm"
          variant={favorite || showRemove ? "outline" : "outline"}
          className={`absolute top-2 right-2 h-8 w-8 rounded-full p-0 ${
            favorite || showRemove
              ? 'bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90'
              : 'bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleAction(e);
          }}
        >
          <Heart 
            className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </Button>
      )}

      {!(showManage || onShowDetails) && (
        <div className="absolute right-3 bottom-3">
          <ExternalLink className="h-4 w-4 text-white/70" />
        </div>
      )}
    </div>
  );
};

export default LargeCard;
