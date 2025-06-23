
import React from 'react';
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
  const iconSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
  
  return (
    <button 
      className={`p-1 rounded-md transition-all duration-200 hover:bg-white/10 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
      title={favorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      <Heart 
        className={`${iconSize} transition-colors duration-200 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-300'}`} 
      />
    </button>
  );
};

export default FavoriteButton;
