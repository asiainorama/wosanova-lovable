
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, aiApps } from '@/data/apps';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface AppContextType {
  favorites: AppData[];
  allApps: AppData[];
  addToFavorites: (app: AppData) => void;
  removeFromFavorites: (appId: string) => void;
  isFavorite: (appId: string) => boolean;
  setAllApps: (apps: AppData[]) => void; 
}

// Define favorites type based on the actual database structure
interface UserFavorite {
  app_data: AppData;
}

// We need this type to help with type conversion from Json to AppData
interface DbUserFavorite {
  app_data: Json;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<AppData[]>([]);
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get user session and update userId
  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    
    fetchUserSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Load favorites from Supabase or localStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (userId) {
        // Try to load from Supabase
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('app_data');
            
          if (data && data.length > 0 && !error) {
            // Use favorites from Supabase - convert Json to AppData
            const favoriteApps = data.map((item: DbUserFavorite) => {
              // Safely convert the Json to AppData
              try {
                return item.app_data as unknown as AppData;
              } catch (e) {
                console.error('Error converting app_data to AppData:', e);
                return null;
              }
            }).filter(Boolean) as AppData[];
            
            setFavorites(favoriteApps);
          } else {
            // If no favorites in Supabase, try localStorage
            const storedFavorites = localStorage.getItem('favorites');
            if (storedFavorites) {
              try {
                const parsedFavorites = JSON.parse(storedFavorites);
                setFavorites(parsedFavorites);
                
                // Save to Supabase for next time
                parsedFavorites.forEach(async (app: AppData) => {
                  try {
                    await supabase
                      .from('user_favorites')
                      .upsert({ 
                        user_id: userId, 
                        app_id: app.id,
                        app_data: app as unknown as Json 
                      });
                  } catch (error) {
                    console.error('Error saving favorite to Supabase:', error);
                  }
                });
              } catch (error) {
                console.error('Error parsing favorites from localStorage', error);
              }
            }
          }
        } catch (error) {
          console.error('Error loading favorites from Supabase:', error);
          // Fall back to localStorage
          const storedFavorites = localStorage.getItem('favorites');
          if (storedFavorites) {
            try {
              setFavorites(JSON.parse(storedFavorites));
            } catch (error) {
              console.error('Error parsing favorites from localStorage', error);
            }
          }
        }
      } else {
        // Not logged in, use localStorage
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          try {
            const parsedFavorites = JSON.parse(storedFavorites);
            setFavorites(parsedFavorites);
          } catch (error) {
            console.error('Error parsing favorites from localStorage', error);
          }
        }
      }
    };
    
    loadFavorites();
  }, [userId]);

  // Save favorites to Supabase and localStorage when they change
  useEffect(() => {
    const saveFavorites = async () => {
      // Always save to localStorage for immediate use
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      if (userId) {
        try {
          // Remove all existing favorites for this user
          await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId);
            
          // Insert new favorites
          if (favorites.length > 0) {
            // Create properly typed favorites for insertion
            const favoritesToInsert = favorites.map(app => ({
              user_id: userId,
              app_id: app.id,
              app_data: app as unknown as Json
            }));
            
            try {
              await supabase
                .from('user_favorites')
                .insert(favoritesToInsert);
            } catch (error) {
              console.error('Error inserting favorites to Supabase:', error);
            }
          }
        } catch (error) {
          console.error('Error saving favorites to Supabase:', error);
        }
      }
    };
    
    saveFavorites();
  }, [favorites, userId]);

  const addToFavorites = (app: AppData) => {
    if (!isFavorite(app.id)) {
      setFavorites(prev => [...prev, app]);
      toast.success(`${app.name} añadida a favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

  const removeFromFavorites = (appId: string) => {
    setFavorites(prev => {
      const app = prev.find(a => a.id === appId);
      const updatedFavorites = prev.filter(a => a.id !== appId);
      if (app) {
        toast.info(`${app.name} eliminada de favoritos`, {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
        });
      }
      return updatedFavorites;
    });
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
