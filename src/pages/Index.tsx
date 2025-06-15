
import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();
  const { getBackgroundStyle } = useBackground();
  const [isLoading, setIsLoading] = useState(true);
  useScrollBehavior();

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Enhanced prefetch and loading state
  useEffect(() => {
    const initializeHome = async () => {
      if (favorites.length > 0) {
        await prefetchAppLogos(favorites);
      }
      
      // Slightly longer delay to ensure smooth animations
      setTimeout(() => {
        setIsLoading(false);
      }, 150);
    };

    initializeHome();
    
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
  }, [favorites]);

  // Listen for custom sidebar open event
  const [, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const handleOpenSidebar = () => {
      setSidebarOpen(true);
      window.dispatchEvent(new CustomEvent('sidebarOpenRequested'));
    };

    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col relative w-full"
      style={getBackgroundStyle()}
    >
      <Header title={t('home.title') || "Inicio"} />
      
      <main className="container mx-auto px-1 py-1 flex-1 flex flex-col">
        {/* Enhanced loading state with better animations */}
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-pulse text-center opacity-0 animate-fade-in" style={{ animationDuration: '200ms', animationFillMode: 'forwards' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
        ) : sortedFavorites.length > 0 ? (
          <div className="flex-grow flex flex-col h-full opacity-0 animate-fade-in transform translate-y-4" style={{ animationDuration: '500ms', animationFillMode: 'forwards', animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
            <AppGrid 
              apps={sortedFavorites}
              useCarousel={true}
              smallerIcons={true}
              carouselKey="home"
            />
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-sm rounded-lg border border-white/30 dark:border-gray-700/30 opacity-0 animate-fade-in transform translate-y-4" style={{ animationDuration: '400ms', animationFillMode: 'forwards', animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
            <div className="flex justify-center mb-4">
              <span className="inline-block p-4 rounded-full bg-primary/10 opacity-0 animate-fade-in transform scale-95" style={{ animationDelay: '100ms', animationDuration: '300ms', animationFillMode: 'forwards' }}>
                <Store size={48} className="text-primary" />
              </span>
            </div>
            <h3 className="text-lg font-medium mb-2 gradient-text opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationDuration: '300ms', animationFillMode: 'forwards' }}>{t('home.noApps') || "No tienes aplicaciones añadidas"}</h3>
            <p className="text-gray-500 mb-4 dark:text-gray-400 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationDuration: '300ms', animationFillMode: 'forwards' }}>{t('home.addFromCatalog') || "Agrega aplicaciones desde el catálogo para verlas aquí"}</p>
            <div className="flex justify-center opacity-0 animate-fade-in transform translate-y-2" style={{ animationDelay: '400ms', animationDuration: '300ms', animationFillMode: 'forwards' }}>
              <Link to="/catalog">
                <Button size="sm" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                  <Store className="h-4 w-4" />
                  <span>{t('home.exploreCatalog') || "Explorar Catálogo"}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
