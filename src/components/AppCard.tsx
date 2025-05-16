
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { safeOpenWindow } from '@/utils/windowUtils';
import ListViewCard from './cards/ListViewCard';
import HomeCard from './cards/HomeCard';
import LargeCard from './cards/LargeCard';
import GridCard from './cards/GridCard';

interface AppCardProps {
  app: AppData; 
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  listView?: boolean;
  smallerIcons?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  listView = false,
  smallerIcons = false
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const favorite = isFavorite(app.id);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isCatalogPage = location.pathname === '/catalog';
  
  // Function to handle favorite action
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

  // Function to handle click on the card
  const handleClick = () => {
    // Only open the app URL directly if not on catalog page
    if (!isCatalogPage) {
      safeOpenWindow(app.url);
    }
  };

  // List view style card
  if (listView) {
    return (
      <ListViewCard 
        app={app} 
        favorite={favorite} 
        handleAction={handleAction} 
        handleClick={isCatalogPage ? undefined : handleClick} 
      />
    );
  }

  // Simple card with only icon and name for the home page
  if (isHomePage) {
    return (
      <HomeCard 
        app={app} 
        favorite={favorite} 
        handleAction={handleAction} 
        handleClick={handleClick}
        showManage={showManage}
        onShowDetails={onShowDetails}
        smallerIcons={smallerIcons}
      />
    );
  }

  // Large card style
  if (isLarge) {
    return (
      <LargeCard 
        app={app} 
        favorite={favorite} 
        showRemove={showRemove}
        showManage={showManage}
        onShowDetails={onShowDetails}
        handleAction={handleAction} 
        handleClick={isCatalogPage ? undefined : handleClick}
      />
    );
  }

  // Grid view (standard view for catalog)
  return (
    <GridCard 
      app={app} 
      favorite={favorite} 
      showManage={showManage}
      showRemove={showRemove}
      onShowDetails={onShowDetails}
      handleAction={handleAction} 
      handleClick={isCatalogPage ? undefined : handleClick}
      smallerIcons={smallerIcons}
    />
  );
};

export default AppCard;
