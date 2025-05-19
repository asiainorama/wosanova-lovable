
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopBarProps {
  isAdmin: boolean;
  activeScreen?: string;
}

const TopBar: React.FC<TopBarProps> = ({ isAdmin, activeScreen }) => {
  const { t } = useLanguage();
  const location = useLocation();
  
  // Helper function to check if current route matches
  const isActive = (path: string): boolean => {
    if (activeScreen) {
      return activeScreen === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/">
        <Button 
          variant="ghost"
          size="icon" 
          className={`rounded-full navigation-icon ${isActive("/") ? "active-icon" : ""} transition-none dark:text-white`}
          aria-label={t('header.home') || "Inicio"}
        >
          <Home className="h-5 w-5" />
        </Button>
      </Link>
      <Link to="/catalog">
        <Button 
          variant="ghost"
          size="icon" 
          className={`rounded-full navigation-icon ${isActive("/catalog") ? "active-icon" : ""} transition-none dark:text-white`}
          aria-label={t('header.catalog') || "Catálogo"}
        >
          <Search className="h-5 w-5" />
        </Button>
      </Link>
      <Link to="/manage">
        <Button 
          variant="ghost"
          size="icon" 
          className={`rounded-full navigation-icon ${isActive("/manage") ? "active-icon" : ""} transition-none dark:text-white`}
          aria-label={t('header.manage') || "Gestionar"}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </Link>
      {isAdmin && (
        <Link to="/admin">
          <Button 
            variant="ghost"
            size="icon" 
            className={`rounded-full navigation-icon ${isActive("/admin") ? "active-icon" : ""} transition-none dark:text-white`}
            aria-label={t('header.admin') || "Administración"}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default React.memo(TopBar);
