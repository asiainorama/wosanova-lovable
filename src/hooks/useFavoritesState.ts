
import { useState, useEffect } from 'react';
import { AppData } from '@/data/types';
import { LocalStorageService } from '@/services/LocalStorageService';
import { SupabaseFavoritesService } from '@/services/SupabaseFavoritesService';

export const useFavoritesState = (userId: string | null) => {
  const [favorites, setFavorites] = useState<AppData[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load favorites from Supabase or localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      // Handle case when userId is not set yet
      if (userId === null && !initialLoadComplete) {
        console.log("User ID not set yet, using local storage only");
        const localFavorites = LocalStorageService.getFavorites();
        setFavorites(localFavorites);
        console.log(`Loaded ${localFavorites.length} favorites from localStorage`);
        setInitialLoadComplete(true);
        return;
      }

      // Handle authenticated user
      if (userId) {
        try {
          const supabaseFavorites = await SupabaseFavoritesService.getFavorites(userId);
          
          if (supabaseFavorites.length > 0) {
            setFavorites(supabaseFavorites);
            LocalStorageService.saveFavorites(supabaseFavorites);
          } else {
            // No favorites in Supabase, check localStorage
            console.log('No favorites found in Supabase, checking localStorage');
            const localFavorites = LocalStorageService.getFavorites();
            
            if (localFavorites.length > 0) {
              setFavorites(localFavorites);
              console.log(`Found ${localFavorites.length} favorites in localStorage, will sync to Supabase`);
              
              // Sync to Supabase
              await SupabaseFavoritesService.syncFavorites(userId, localFavorites);
            } else {
              console.log('No favorites found in localStorage');
              setFavorites([]);
            }
          }
        } catch (error) {
          console.error('Error loading favorites from Supabase:', error);
          
          // Fallback to localStorage
          const localFavorites = LocalStorageService.getFavorites();
          setFavorites(localFavorites);
          console.log('Loaded favorites from localStorage after Supabase error');
        }
      } else {
        // User not logged in, use localStorage only
        console.log('User not logged in, using localStorage for favorites');
        const localFavorites = LocalStorageService.getFavorites();
        setFavorites(localFavorites);
        console.log(`Loaded ${localFavorites.length} favorites from localStorage (not logged in)`);
      }
    };
    
    loadFavorites();
  }, [userId, initialLoadComplete]);

  return {
    favorites,
    setFavorites
  };
};
