
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  favorite: boolean;
  showRemove?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  favorite, 
  showRemove = false,
  onClick,
  className = ''
}) => {
  return (
    <Button 
      size="sm"
      variant="outline"
      className={`h-6 w-6 rounded-full p-0 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
      title={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      <Heart 
        className={`h-3 w-3 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
      />
    </Button>
  );
};

export default FavoriteButton;
