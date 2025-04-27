
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, aiApps } from '@/data/apps';
import { toast } from 'sonner';

interface AppContextType {
  favorites: AppData[];
  allApps: AppData[];
  addToFavorites: (app: AppData) => void;
  removeFromFavorites: (appId: string) => void;
  isFavorite: (appId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<AppData[]>([]);
  const [allApps, setAllApps] = useState<AppData[]>(aiApps);
  
  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Error parsing favorites from localStorage', error);
      }
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (app: AppData) => {
    if (!isFavorite(app.id)) {
      setFavorites(prev => [...prev, app]);
      toast.success(`${app.name} añadida a favoritos`);
    }
  };

  const removeFromFavorites = (appId: string) => {
    setFavorites(prev => {
      const app = prev.find(a => a.id === appId);
      const updatedFavorites = prev.filter(a => a.id !== appId);
      if (app) {
        toast.info(`${app.name} eliminada de favoritos`);
      }
      return updatedFavorites;
    });
  };

  const isFavorite = (appId: string) => {
    return favorites.some(app => app.id === appId);
  };

  return (
    <AppContext.Provider value={{ favorites, allApps, addToFavorites, removeFromFavorites, isFavorite }}>
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
