
import { AppData } from '@/data/types';
import { LocalStorageService } from '@/services/LocalStorageService';
import { SupabaseFavoritesService } from '@/services/SupabaseFavoritesService';
import { useFavoritesState } from './useFavoritesState';

export const useFavoritesSync = (userId: string | null) => {
  const { favorites, setFavorites } = useFavoritesState(userId);

  // Sync favorites to Supabase
  const syncFavoritesToSupabase = async (favoritesToSync: AppData[] = favorites) => {
    if (!userId || favoritesToSync.length === 0) return;
    
    try {
      await SupabaseFavoritesService.syncFavorites(userId, favoritesToSync);
    } catch (error) {
      // Error already handled in service
    }
  };

  // Remove from Supabase
  const removeFromSupabase = async (appId: string) => {
    if (!userId) return;
    
    try {
      await SupabaseFavoritesService.removeFavorite(userId, appId);
    } catch (error) {
      // Error already handled in service
    }
  };

  return {
    favorites,
    setFavorites,
    syncFavoritesToSupabase,
    removeFromSupabase
  };
};
