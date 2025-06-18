
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useHomePageLogic } from '@/hooks/useHomePageLogic';
import HomeContent from '@/components/home/HomeContent';

const Index = () => {
  const { t } = useLanguage();
  const { getBackgroundStyle } = useBackground();
  const { sortedFavorites, isLoading } = useHomePageLogic();
  useScrollBehavior();

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
        <HomeContent 
          sortedFavorites={sortedFavorites} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default Index;
