
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, Search, Trash2 } from 'lucide-react';
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

// Helper function to get icon by name
const getIconByName = (name: string) => {
  switch (name.toLowerCase()) {
    case 'home':
      return <Home className="h-5 w-5" />;
    case 'catalog':
    case 'search':
      return <Search className="h-5 w-5" />;
    case 'manage':
    case 'trash':
      return <Trash2 className="h-5 w-5" />;
    default:
      return <Home className="h-5 w-5" />;
  }
};

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onSidebarOpen,
  searchTerm = '',
  onSearchChange,
  selectedCategory = null,
  onCategoryChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { allApps } = useAppContext();
  const location = useLocation();

  // Determine if we're on catalog page to show search
  const isCatalogPage = location.pathname === '/catalog';

  // Get unique categories from all apps
  const categories = [...new Set(allApps.map(app => app.category))].sort();

  // Determine active page from title
  const determineActivePage = () => {
    if (title.includes("Catálogo") || title.includes("Catalog")) return "catalog";
    if (title.includes("Gestionar") || title.includes("Manage")) return "manage";
    if (title.includes("Admin") || title.includes("Administración")) return "admin";
    return "home";
  };

  // Create links array without admin link (admin access is handled in sidebar)
  const getNavigationLinks = () => {
    const links = [
      { text: 'Home', href: '/', icon: null },
      { text: 'Catalog', href: '/catalog', icon: null },
      { text: 'Manage', href: '/manage', icon: null },
    ];
    
    return links;
  };

  const activePage = determineActivePage();
  const navigationLinks = getNavigationLinks();

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
          <div className="flex items-center justify-between gap-4">
            {/* Left side - app logo and hamburger menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
                alt="WosaNova Logo" 
                className="w-8 h-8"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="dark:text-white dark:hover:bg-white/10 hover:bg-black/5 transition-colors"
                onClick={handleSidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Center - Search Bar (only on catalog page) */}
            {isCatalogPage && onSearchChange && onCategoryChange && (
              <div className="flex-1 max-w-md mx-4">
                <UnifiedSearchBar
                  searchTerm={searchTerm}
                  onSearchChange={onSearchChange}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                  categories={categories}
                />
              </div>
            )}
            
            {/* Right side - navigation icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {navigationLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant={activePage === link.text.toLowerCase() ? "default" : "ghost"}
                    size="icon"
                    className={`rounded-full transition-all ${
                      activePage === link.text.toLowerCase()
                        ? "bg-primary/90 text-white shadow-lg backdrop-blur-sm"
                        : "text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    aria-label={link.text}
                  >
                    {link.icon || getIconByName(link.text)}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
