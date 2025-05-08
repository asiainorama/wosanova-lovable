import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store, Database } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();
  const [iconCount, setIconCount] = useState<number>(0);

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
    
    // Get icon count from Supabase
    const checkStoredIcons = async () => {
      try {
        const { count, error } = await supabase
          .from('app_icons')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setIconCount(count);
        }
      } catch (err) {
        console.error("Error checking icon count:", err);
      }
    };
    
    // Check initially and refresh every minute
    checkStoredIcons();
    const interval = setInterval(checkStoredIcons, 60000);
    
    return () => clearInterval(interval);
  }, [favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header title={t('home.title') || "Inicio"} />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {sortedFavorites.length > 0 ? (
          <div className="py-3">
            <AppGrid 
              apps={sortedFavorites} 
              compact={true} 
              moreCompact={true}
              smallerIcons={true}
            />
            
            {/* Show database stats */}
            <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Database className="h-3 w-3 mr-1" /> 
              <span>{iconCount} {iconCount === 1 ? 'icono almacenado' : 'iconos almacenados'} en la base de datos</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-background shadow-sm rounded-lg border dark:bg-gray-800 dark:border-gray-700">
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
