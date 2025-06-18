
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';

export const useHomePageLogic = () => {
  const { favorites } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Prefetch logos and set loading state
  useEffect(() => {
    const initializeHome = async () => {
      if (favorites.length > 0) {
        await prefetchAppLogos(favorites);
      }
      
      // Very short delay to prevent flash
      setTimeout(() => {
        setIsLoading(false);
      }, 50);
    };

    initializeHome();
    
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
  }, [favorites]);

  return {
    sortedFavorites,
    isLoading
  };
};
