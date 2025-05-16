
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  favorite: boolean;
  showRemove?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'small' | 'normal';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  favorite, 
  showRemove = false,
  onClick,
  className = '',
  size = 'normal'
}) => {
  const buttonSize = size === 'small' ? 'h-5 w-5' : 'h-6 w-6';
  const iconSize = size === 'small' ? 'h-2.5 w-2.5' : 'h-3 w-3';
  
  return (
    <Button 
      size="sm"
      variant="outline"
      className={`${buttonSize} rounded-full p-0 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
      title={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      <Heart 
        className={`${iconSize} ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
      />
    </Button>
  );
};

export default FavoriteButton;
