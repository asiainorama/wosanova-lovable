
import React from 'react';
import { AppData } from '@/data/apps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';
import AvatarFallback from './AvatarFallback';

interface ListViewCardProps {
  app: AppData;
  favorite: boolean;
  handleAction: (e: React.MouseEvent) => void;
  handleClick: () => void;
}

const ListViewCard: React.FC<ListViewCardProps> = ({ app, favorite, handleAction, handleClick }) => {
  const { imageUrl, isLoading, error } = useAppLogo(app);

  return (
    <div 
      className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4">
        {isLoading && <Skeleton className="w-12 h-12 rounded-md" />}
        
        {!error ? (
          <img 
            src={imageUrl} 
            alt={`${app.name} icon`}
            className={`w-12 h-12 rounded-md object-contain dark:brightness-110 ${isLoading ? 'hidden' : 'block'}`}
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <AvatarFallback 
              letter={app.name.substring(0, 1)}
              className="w-12 h-12 rounded-md"
            />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium dark:text-white">{app.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{app.description}</p>
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
