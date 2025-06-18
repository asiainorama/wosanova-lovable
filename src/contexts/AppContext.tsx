
import React, { createContext, useContext } from 'react';
import { AppData } from '@/data/types';
import { toast } from 'sonner';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useFavoritesSync } from '@/hooks/useFavoritesSync';
import { useAppsManager } from '@/hooks/useAppsManager';

interface AppContextType {
  favorites: AppData[];
  allApps: AppData[];
  addToFavorites: (app: AppData) => void;
  removeFromFavorites: (appId: string) => void;
  isFavorite: (appId: string) => boolean;
  setAllApps: (apps: AppData[]) => void; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use the new custom hooks
  const userId = useAuthenticatedUser();
  const { favorites, setFavorites, syncFavoritesToSupabase, removeFromSupabase } = useFavoritesSync(userId);
  const { allApps, setAllApps } = useAppsManager();

  const addToFavorites = (app: AppData) => {
    if (!isFavorite(app.id)) {
      const updatedFavorites = [...favorites, app];
      setFavorites(updatedFavorites);
      
      // Update localStorage for immediate use
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      // Sync to Supabase if logged in
      if (userId) {
        syncFavoritesToSupabase(updatedFavorites);
      }
      
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
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // Remove from Supabase if logged in
    if (userId) {
      removeFromSupabase(appId);
    }
    
    if (app) {
      toast.info(`${app.name} eliminada de favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

  const isFavorite = (appId: string) => {
    return favorites.some(app => app.id === appId);
  };

  return (
    <AppContext.Provider value={{ 
      favorites, 
      allApps, 
      addToFavorites, 
      removeFromFavorites, 
      isFavorite,
      setAllApps
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
