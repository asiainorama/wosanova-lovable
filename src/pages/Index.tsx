
import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useBackground } from '@/contexts/BackgroundContext';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();
  const { background } = useBackground();
  useScrollBehavior();

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Prefetch logos for favorite apps as soon as home page loads (without toast)
  useEffect(() => {
    if (favorites.length > 0) {
      prefetchAppLogos(favorites);
    }
    
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
  }, [favorites]);

  // Log current background for debugging
  useEffect(() => {
    console.log('Index page - current background:', background);
  }, [background]);

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
    <div className="min-h-screen flex flex-col relative" style={{ background: 'transparent' }}>
      <Header title={t('home.title') || "Inicio"} />
      
      <main className="container mx-auto px-1 py-1 flex-1 flex flex-col" style={{ background: 'transparent' }}>
        {sortedFavorites.length > 0 ? (
          <div className="flex-grow flex flex-col h-full">
            <AppGrid 
              apps={sortedFavorites}
              useCarousel={true}
              smallerIcons={true}
              carouselKey="home"
            />
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-sm rounded-lg border border-white/30 dark:border-gray-700/30">
            <div className="flex justify-center mb-4">
              <span className="inline-block p-4 rounded-full bg-primary/10">
                <Store size={48} className="text-primary" />
              </span>
            </div>
            <h3 className="text-lg font-medium mb-2 gradient-text">{t('home.noApps') || "No tienes aplicaciones añadidas"}</h3>
            <p className="text-gray-500 mb-4 dark:text-gray-400">{t('home.addFromCatalog') || "Agrega aplicaciones desde el catálogo para verlas aquí"}</p>
            <div className="flex justify-center">
              <Link to="/catalog">
                <Button size="sm" className="flex items-center gap-2">
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
