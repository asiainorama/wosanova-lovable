
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  smallSize?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  smallSize = false
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`${smallSize ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all focus:outline-none`}
    >
      <Star
        className={`${smallSize ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${
          isFavorite
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-transparent text-gray-400 dark:text-gray-300'
        }`}
      />
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
};

export default FavoriteButton;
