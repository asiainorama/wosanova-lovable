
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const EmptyHomeState: React.FC = () => {
  const { t } = useLanguage();

  return (
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
  );
};

export default EmptyHomeState;
