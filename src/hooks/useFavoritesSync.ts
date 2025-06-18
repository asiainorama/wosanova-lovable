
import { useState, useEffect } from 'react';
import { AppData } from '@/data/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface UserFavorite {
  app_data: AppData;
}

interface DbUserFavorite {
  app_data: Json;
}

export const useFavoritesSync = (userId: string | null) => {
  const [favorites, setFavorites] = useState<AppData[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load favorites from Supabase or localStorage
  useEffect(() => {
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
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('app_data, app_id');
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log(`Found ${data.length} favorites in Supabase`);
            
            const favoriteApps: AppData[] = [];
            
            for (const item of data) {
              try {
                const appData = item.app_data as any;
                
                if (!appData.id || !appData.name) {
                  console.error('Invalid app_data structure:', appData);
                  continue;
                }
                
                const validAppData: AppData = {
                  id: appData.id,
                  name: appData.name,
                  url: appData.url || '',
                  category: appData.category || 'other',
                  icon: appData.icon || '/placeholder.svg',
                  description: appData.description || '',
                  isAI: appData.isAI !== undefined ? appData.isAI : false,
                };
                
                favoriteApps.push(validAppData);
              } catch (e) {
                console.error('Error converting app_data to AppData:', e, item);
              }
            }
            
            setFavorites(favoriteApps);
            localStorage.setItem('favorites', JSON.stringify(favoriteApps));
            
          } else {
            console.log('No favorites found in Supabase, checking localStorage');
            const storedFavorites = localStorage.getItem('favorites');
            if (storedFavorites) {
              try {
                const parsedFavorites = JSON.parse(storedFavorites);
                setFavorites(parsedFavorites);
                console.log(`Found ${parsedFavorites.length} favorites in localStorage, will sync to Supabase`);
                
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
  }, [userId, initialLoadComplete]);

  // Sync favorites to Supabase
  const syncFavoritesToSupabase = async (favoritesToSync: AppData[] = favorites) => {
    if (!userId || favoritesToSync.length === 0) return;
    
    console.log(`Syncing ${favoritesToSync.length} favorites to Supabase for user ${userId}`);
    
    try {
      const favoritesToUpsert = favoritesToSync.map(app => ({
        user_id: userId,
        app_id: app.id,
        app_data: app as unknown as Json
      }));
      
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

  // Remove from Supabase
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

  return {
    favorites,
    setFavorites,
    syncFavoritesToSupabase,
    removeFromSupabase
  };
};
