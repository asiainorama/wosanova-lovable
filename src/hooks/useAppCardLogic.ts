import { useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { AppData } from '@/data/types';
import { toast } from 'sonner';
import { safeOpenWindow } from '@/utils/windowUtils';
import { CardTypeService } from '@/services/CardTypeService';

export const useAppCardLogic = (
  app: AppData,
  showRemove: boolean,
  listView: boolean,
  isLarge: boolean
) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const location = useLocation();
  
  const favorite = isFavorite(app.id);
  const isHomePage = location.pathname === '/';
  const isCatalogPage = location.pathname === '/catalog';
  
  const cardConfig = CardTypeService.determineCardType(
    listView,
    isHomePage,
    isCatalogPage,
    isLarge
  );

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (showRemove || favorite) {
      removeFromFavorites(app.id);
      toast.success(`${app.name} eliminada de favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
      });
    } else {
      addToFavorites(app);
      toast.success(`${app.name} añadida a favoritos`, {
        className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
      });
    }
  };

  const handleClick = cardConfig.shouldOpenDirectly ? () => {
    safeOpenWindow(app.url);
  } : undefined;

  return {
    favorite,
    cardType: cardConfig.type,
    handleAction,
    handleClick
  };
};