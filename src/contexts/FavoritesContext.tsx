
import React, { createContext, useContext } from 'react';
import { AppData } from '@/data/types';
import { toast } from 'sonner';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useFavoritesSync } from '@/hooks/useFavoritesSync';
import { LocalStorageService } from '@/services/LocalStorageService';

interface FavoritesContextType {
  favorites: AppData[];
  addToFavorites: (app: AppData) => void;
  removeFromFavorites: (appId: string) => void;
  isFavorite: (appId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthenticatedUser();
  const { favorites, setFavorites, syncFavoritesToSupabase, removeFromSupabase } = useFavoritesSync(userId);

  const addToFavorites = (app: AppData) => {
    // Si no hay usuario, solo usar localStorage
    if (!userId) {
      if (!isFavorite(app.id)) {
        const updatedFavorites = [...favorites, app];
        setFavorites(updatedFavorites);
        LocalStorageService.saveFavorites(updatedFavorites);
        
        toast.success(`${app.name} añadida a favoritos localmente`, {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
        });
      }
      return;
    }

    // Usuario autenticado - funcionalidad original
    if (!isFavorite(app.id)) {
      const updatedFavorites = [...favorites, app];
      setFavorites(updatedFavorites);
      
      // Update localStorage for immediate use
      LocalStorageService.saveFavorites(updatedFavorites);
      
      // Sync to Supabase if logged in
      syncFavoritesToSupabase(updatedFavorites);
      
      toast.success(`${app.name} añadida a favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

  const removeFromFavorites = (appId: string) => {
    const app = favorites.find(a => a.id === appId);
    const updatedFavorites = favorites.filter(a => a.id !== appId);
    
    setFavorites(updatedFavorites);
    
    // Update localStorage immediately
    LocalStorageService.saveFavorites(updatedFavorites);
    
    // Remove from Supabase if logged in
    if (userId) {
      removeFromSupabase(appId);
    }
    
    if (app) {
      const message = userId ? 
        `${app.name} eliminada de favoritos` : 
        `${app.name} eliminada de favoritos locales`;
        
      toast.info(message, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

  const isFavorite = (appId: string) => {
    return favorites.some(app => app.id === appId);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addToFavorites, 
      removeFromFavorites, 
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
