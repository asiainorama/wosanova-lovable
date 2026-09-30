
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import UnifiedSearchBar from '@/components/UnifiedSearchBar';

interface HeaderProps {
  title: string;
  onSidebarOpen?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onSidebarOpen,
  searchTerm = '',
  onSearchChange,
  selectedCategory = null,
  onCategoryChange
}) => {
  const { t } = useLanguage();
  const { allApps } = useAppContext();
  const location = useLocation();

  // Determine if we're on catalog page to show search
  const isCatalogPage = location.pathname === '/catalog';

  // Get unique categories from all apps
  const categories = [...new Set(allApps.map(app => app.category))].sort();

  // Get sidebar open function from parent or create a default one
  const handleSidebarOpen = () => {
    if (onSidebarOpen) {
      onSidebarOpen();
    } else {
      // Dispatch the correct event name that App.tsx is listening for
      window.dispatchEvent(new CustomEvent('sidebarOpenRequested'));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* We keep the title hidden but in the DOM for functionality */}
      <span className="sr-only">{title}</span>
      
      {/* Glassmorphism effect with backdrop blur and translucent background */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 w-full border-b border-white/20 dark:border-gray-800/30 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="w-full px-4 py-2">
          <div className="relative flex h-10 items-center justify-between">
            <Button variant="ghost" size="icon" className="text-foreground" onClick={handleSidebarOpen} aria-label={t('header.menu')} title={t('header.menu')}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="absolute left-1/2 -translate-x-1/2 text-foreground" aria-label={t('header.home')}>
              <Link to="/" aria-label={t('header.home')} title={t('header.home')}><Home className="h-5 w-5" /></Link>
            </Button>
            {!isCatalogPage && (
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground" aria-label={t('header.catalog')}>
                <Link to="/catalog" aria-label={t('header.catalog')} title={t('header.catalog')}><Search className="h-5 w-5" /></Link>
              </Button>
            )}
          </div>
          {isCatalogPage && onSearchChange && onCategoryChange && (
            <div className="mt-2">
              <UnifiedSearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} categories={categories} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
