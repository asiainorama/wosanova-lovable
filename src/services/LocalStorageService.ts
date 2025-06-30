
import { AppData } from '@/data/types';
import { toast } from 'sonner';

export class LocalStorageService {
  private static readonly FAVORITES_KEY = 'favorites';

  static getFavorites(): AppData[] {
    try {
      const storedFavorites = localStorage.getItem(this.FAVORITES_KEY);
      if (storedFavorites) {
        return JSON.parse(storedFavorites);
      }
      return [];
    } catch (error) {
      console.error('Error parsing favorites from localStorage', error);
      toast.error('Error al cargar favoritos locales', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
      return [];
    }
  }

  static saveFavorites(favorites: AppData[]): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
      toast.error('Error al guardar favoritos locales', {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
      });
    }
  }

  static clearFavorites(): void {
    localStorage.removeItem(this.FAVORITES_KEY);
  }
}
