
import React, { useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();

  // Sort favorites alphabetically
  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  // Prefetch logos for favorite apps as soon as home page loads (without toast)
  useEffect(() => {
    if (favorites.length > 0) {
      // Use silent mode to avoid notifications
      prefetchAppLogos(favorites);
    }
  }, [favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header title={t('home.title') || "Inicio"} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-4">
          <h2 className="text-lg font-semibold dark:text-white">{t('home.myApps') || "Mis Aplicaciones"}</h2>
        </div>
        
        {sortedFavorites.length > 0 ? (
          <div className="py-2">
            <AppGrid 
              apps={sortedFavorites} 
              compact={true} 
              moreCompact={true}
              smallerIcons={true}
            />
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-background shadow-sm rounded-lg border dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <span className="inline-block p-4 rounded-full bg-primary/10">
                <Store size={48} className="text-primary" />
              </span>
            </div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">{t('home.noApps') || "No tienes aplicaciones añadidas"}</h3>
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
