
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Get user session and update userId
  useEffect(() => {
    const fetchUserSession = async () => {
      console.log('Fetching user session...');
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      if (session?.user?.id) {
        console.log('User is logged in with ID:', session.user.id);
      } else {
        console.log('No active user session found');
      }
    };
    
    fetchUserSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id || 'no user');
      setUserId(session?.user?.id || null);
      
      // If user just logged in, we'll reload favorites from Supabase
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log('User signed in, will load favorites');
      }
      
      // If user just logged out, we'll clear favorites
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing favorites');
        setFavorites([]);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Load favorites from Supabase or localStorage on mount or when userId changes
  useEffect(() => {
    // Skip loading if user isn't set yet
    if (userId === null && !initialLoadComplete) {
      console.log("User ID not set yet, using local storage only");
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(parsedFavorites);
          console.log(`Loaded ${parsedFavorites.length} favorites from localStorage`);
        } catch (error) {
          console.error('Error parsing favorites from localStorage', error);
          toast.error('Error al cargar favoritos locales', {
            className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
          });
        }
      }
      setInitialLoadComplete(true);
      return;
    }

    const loadFavorites = async () => {
      if (userId) {
        console.log(`Loading favorites for user ${userId} from Supabase...`);
        // Try to load from Supabase
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('app_data, app_id');
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Use favorites from Supabase - convert Json to AppData
            console.log(`Found ${data.length} favorites in Supabase`);
            
            // Safely convert the Json to AppData, with proper error handling for each item
            const favoriteApps: AppData[] = [];
            
            for (const item of data) {
              try {
                // Ensure app_data has all required fields for AppData
                const appData = item.app_data as any;
                
                // Validate that we have the minimum required fields
                if (!appData.id || !appData.name) {
                  console.error('Invalid app_data structure:', appData);
                  continue;
                }
                
                // Ensure we have other required fields with defaults
                const validAppData: AppData = {
                  id: appData.id,
                  name: appData.name,
                  url: appData.url || '',
                  category: appData.category || 'other',
                  icon: appData.icon || '/placeholder.svg',
                  description: appData.description || '',
                  tags: Array.isArray(appData.tags) ? appData.tags : [],
                  features: Array.isArray(appData.features) ? appData.features : [],
                };
                
                favoriteApps.push(validAppData);
              } catch (e) {
                console.error('Error converting app_data to AppData:', e, item);
              }
            }
            
            setFavorites(favoriteApps);
            
            // Also update localStorage for offline access
            localStorage.setItem('favorites', JSON.stringify(favoriteApps));
            
          } else {
            // If no favorites in Supabase, try localStorage
            console.log('No favorites found in Supabase, checking localStorage');
            const storedFavorites = localStorage.getItem('favorites');
            if (storedFavorites) {
              try {
                const parsedFavorites = JSON.parse(storedFavorites);
                setFavorites(parsedFavorites);
                console.log(`Found ${parsedFavorites.length} favorites in localStorage, will sync to Supabase`);
                
                // Save to Supabase for next time
                await syncFavoritesToSupabase(parsedFavorites);
              } catch (error) {
                console.error('Error parsing favorites from localStorage', error);
                toast.error('Error al cargar favoritos locales', {
                  className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
                });
              }
            } else {
              console.log('No favorites found in localStorage');
              setFavorites([]);
            }
          }
        } catch (error) {
          console.error('Error loading favorites from Supabase:', error);
          toast.error('Error al cargar favoritos', {
            className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
          });
          
          // Fall back to localStorage
          const storedFavorites = localStorage.getItem('favorites');
          if (storedFavorites) {
            try {
              setFavorites(JSON.parse(storedFavorites));
              console.log('Loaded favorites from localStorage after Supabase error');
            } catch (error) {
              console.error('Error parsing favorites from localStorage', error);
            }
          }
        }
      } else {
        // Not logged in, use localStorage
        console.log('User not logged in, using localStorage for favorites');
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          try {
            const parsedFavorites = JSON.parse(storedFavorites);
            setFavorites(parsedFavorites);
            console.log(`Loaded ${parsedFavorites.length} favorites from localStorage (not logged in)`);
          } catch (error) {
            console.error('Error parsing favorites from localStorage', error);
            toast.error('Error al cargar favoritos locales', {
              className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
            });
          }
        }
      }
    };
    
    loadFavorites();
  }, [userId]);

  // Sync favorites to Supabase with upsert
  const syncFavoritesToSupabase = async (favoritesToSync: AppData[] = favorites) => {
    if (!userId || favoritesToSync.length === 0) return;
    
    console.log(`Syncing ${favoritesToSync.length} favorites to Supabase for user ${userId}`);
    
    try {
      // Create properly typed favorites for upsert
      const favoritesToUpsert = favoritesToSync.map(app => ({
        user_id: userId,
        app_id: app.id,
        app_data: app as unknown as Json
      }));
      
      // Use upsert to avoid deleting and recreating
      const { error } = await supabase
        .from('user_favorites')
        .upsert(favoritesToUpsert, { 
          onConflict: 'user_id,app_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error upserting favorites to Supabase:', error);
        throw error;
      }
      
      console.log('Successfully synced favorites to Supabase');
    } catch (error) {
      console.error('Error in syncFavoritesToSupabase:', error);
      toast.error('Error al sincronizar favoritos', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

  // If a favorite is removed, remove it from Supabase
  const removeFromSupabase = async (appId: string) => {
    if (!userId) return;
    
    console.log(`Removing favorite ${appId} from Supabase for user ${userId}`);
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('app_id', appId);
      
      if (error) {
        console.error('Error removing favorite from Supabase:', error);
        throw error;
      }
      
      console.log('Successfully removed favorite from Supabase');
    } catch (error) {
      console.error('Error in removeFromSupabase:', error);
      toast.error('Error al eliminar favorito', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  };

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
