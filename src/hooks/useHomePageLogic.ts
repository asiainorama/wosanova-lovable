
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { fastImagePreloader } from '@/services/FastImagePreloader';

export const useHomePageLogic = () => {
  const { favorites } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Inicialización ultrarrápida
  useEffect(() => {
    const initializeHome = async () => {
      if (favorites.length > 0) {
        // Precarga inmediata de imágenes críticas
        await fastImagePreloader.preloadCriticalImages(favorites);
      }
      
      // Carga inmediata sin demora
      setIsLoading(false);
    };

    initializeHome();
    
    // Configurar comportamiento de scroll
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
  }, [favorites]);

  return {
    sortedFavorites,
    isLoading
  };
};
