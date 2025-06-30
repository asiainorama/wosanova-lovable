
import { AppData } from '@/data/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export class SupabaseFavoritesService {
  static async getFavorites(userId: string): Promise<AppData[]> {
    console.log(`Loading favorites for user ${userId} from Supabase...`);
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('app_data, app_id')
        .eq('user_id', userId);
        
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
        
        return favoriteApps;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading favorites from Supabase:', error);
      toast.error('Error al cargar favoritos', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
      throw error;
    }
  }

  static async syncFavorites(userId: string, favorites: AppData[]): Promise<void> {
    if (favorites.length === 0) return;
    
    console.log(`Syncing ${favorites.length} favorites to Supabase for user ${userId}`);
    
    try {
      const favoritesToUpsert = favorites.map(app => ({
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
      console.error('Error in syncFavorites:', error);
      toast.error('Error al sincronizar favoritos', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
      throw error;
    }
  }

  static async removeFavorite(userId: string, appId: string): Promise<void> {
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
      console.error('Error in removeFavorite:', error);
      toast.error('Error al eliminar favorito', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
      throw error;
    }
  }
}
