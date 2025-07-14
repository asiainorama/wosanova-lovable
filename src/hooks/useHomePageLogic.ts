
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { fastImagePreloader } from '@/services/FastImagePreloader';
import { supabase } from '@/integrations/supabase/client';

export const useHomePageLogic = () => {
  const { favorites } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sort favorites alphabetically - only show if authenticated
  const sortedFavorites = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites, isAuthenticated]);

  // Inicialización ultrarrápida
  useEffect(() => {
    const initializeHome = async () => {
      if (isAuthenticated && favorites.length > 0) {
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
  }, [favorites, isAuthenticated]);

  return {
    sortedFavorites,
    isLoading,
    isAuthenticated
  };
};
