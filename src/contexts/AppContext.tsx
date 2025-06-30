
import React, { createContext, useContext } from 'react';
import { AppData } from '@/data/types';
import { FavoritesProvider, useFavorites } from '@/contexts/FavoritesContext';
import { AppsProvider, useApps } from '@/contexts/AppsContext';

interface AppContextType {
  favorites: AppData[];
  allApps: AppData[];
  addToFavorites: (app: AppData) => void;
  removeFromFavorites: (appId: string) => void;
  isFavorite: (appId: string) => boolean;
  setAllApps: (apps: AppData[]) => void; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { allApps, setAllApps } = useApps();

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <AppsProvider>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </AppsProvider>
    </FavoritesProvider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
