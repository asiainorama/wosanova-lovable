
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
  const { background, getBackgroundStyle } = useBackground();
  const [isLoading, setIsLoading] = useState(true);
  useScrollBehavior();

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Prefetch logos and set loading state
  useEffect(() => {
    const initializeHome = async () => {
      if (favorites.length > 0) {
        await prefetchAppLogos(favorites);
      }
      
      // Very short delay to prevent flash
      setTimeout(() => {
        setIsLoading(false);
      }, 50); // Reduced from 100ms to 50ms
    };

    initializeHome();
    
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
  }, [favorites]);

  // Force background application when component mounts or background changes
  useEffect(() => {
    console.log('Index page - forcing background application:', background);
    
    // Aplicar el fondo inmediatamente
    const style = getBackgroundStyle();
    const applyStyles = (element: HTMLElement | null) => {
      if (!element) return;
      
      // Limpiar estilos anteriores
      element.style.backgroundImage = '';
      element.style.background = '';
      element.style.backgroundColor = '';
      element.style.backgroundSize = '';
      element.style.backgroundPosition = '';
      element.style.backgroundRepeat = '';
      element.style.backgroundAttachment = '';
      
      // Aplicar nuevo estilo
      if (style.backgroundImage) {
        element.style.backgroundImage = style.backgroundImage as string;
        element.style.backgroundSize = style.backgroundSize as string;
        element.style.backgroundPosition = style.backgroundPosition as string;
        element.style.backgroundRepeat = style.backgroundRepeat as string;
        element.style.backgroundAttachment = style.backgroundAttachment as string;
      } else if (style.background) {
        element.style.background = style.background as string;
      }
    };
    
    // Aplicar a html, body y root
    applyStyles(document.documentElement);
    applyStyles(document.body);
    applyStyles(document.getElementById('root'));
    
  }, [background, getBackgroundStyle]);

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
        {/* Show loading state initially to prevent flash */}
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
            </div>
          </div>
        ) : sortedFavorites.length > 0 ? (
          <div className="flex-grow flex flex-col h-full opacity-0 animate-fade-in" style={{ animationDuration: '150ms', animationFillMode: 'forwards' }}>
            <AppGrid 
              apps={sortedFavorites}
              useCarousel={true}
              smallerIcons={true}
              carouselKey="home"
            />
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-sm rounded-lg border border-white/30 dark:border-gray-700/30 opacity-0 animate-fade-in" style={{ animationDuration: '150ms', animationFillMode: 'forwards' }}>
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
