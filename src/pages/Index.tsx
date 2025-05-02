
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { 
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppCard from '@/components/AppCard';

const Index = () => {
  const { favorites } = useAppContext();
  const { t } = useLanguage();

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
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {favorites.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="py-3 px-1">
              <div className="flex space-x-4 pb-4">
                {favorites.map((app) => (
                  <div key={app.id} className="min-w-[120px]">
                    <AppCard 
                      key={app.id} 
                      app={app} 
                      smallerIcons={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
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
