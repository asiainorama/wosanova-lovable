
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
import SidebarMenu from '@/components/SidebarMenu';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();
  const { background } = useBackground();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Touch event handlers for swipe detection
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      console.log('Touch start:', { startX, startY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      console.log('Touch end:', { 
        startX, 
        endX, 
        deltaX, 
        deltaY, 
        deltaTime,
        startFromLeftEdge: startX <= 100
      });

      // Only trigger if swipe starts from the left edge of the screen (first 100px)
      if (startX <= 100) {
        // Check if it's a right swipe (positive deltaX) with sufficient distance and speed
        if (deltaX > 50 && Math.abs(deltaY) < 100 && deltaTime < 500) {
          console.log('Opening sidebar from swipe');
          setIsSidebarOpen(true);
        }
      }
    };

    // Add event listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <>
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

      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onOpenChange={setIsSidebarOpen} 
      />
    </>
  );
};

export default Index;
