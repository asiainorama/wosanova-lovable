
import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { toast } from 'sonner';

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
  const userId = useAuthenticatedUser();
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Si no hay usuario autenticado, redirigir al login
    if (!userId) {
      toast.info('Inicia sesión para añadir favoritos');
      navigate('/auth');
      return;
    }
    
    // Si hay usuario, ejecutar la acción original
    onClick(e);
  };
  
  return (
    <button 
      className={`p-1 rounded-md transition-all duration-200 hover:bg-white/10 ${className}`}
      onClick={handleClick}
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
