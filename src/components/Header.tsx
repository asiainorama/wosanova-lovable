
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  title: string;
  onSidebarOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onSidebarOpen
}) => {
  const { t } = useLanguage();
  const location = useLocation();

  const isCatalogPage = location.pathname === '/catalog';

  const handleSidebarOpen = () => {
    if (onSidebarOpen) {
      onSidebarOpen();
    } else {
      window.dispatchEvent(new CustomEvent('sidebarOpenRequested'));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <span className="sr-only">{title}</span>
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 w-full border-b border-white/20 dark:border-gray-800/30 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="w-full px-4 py-2">
          <div className="relative flex h-10 items-center justify-between">
            <Button variant="ghost" size="icon" className="text-foreground" onClick={handleSidebarOpen} aria-label={t('header.menu')} title={t('header.menu')}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button asChild variant="ghost" size="icon" className={isCatalogPage ? 'text-[hsl(var(--blue-500))]' : 'text-foreground'}>
              <Link to="/catalog" aria-label={t('header.catalog')} aria-current={isCatalogPage ? 'page' : undefined} title={t('header.catalog')}><Search className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
