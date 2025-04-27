
import React from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Index = () => {
  const { favorites } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title="Inicio" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Mis Aplicaciones</h2>
        </div>
        
        {favorites.length > 0 ? (
          <AppGrid apps={favorites} />
        ) : (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-700">
            <h3 className="text-xl font-medium mb-2 dark:text-white">No tienes aplicaciones añadidas</h3>
            <p className="text-gray-500 mb-6 dark:text-gray-400">Agrega aplicaciones desde el catálogo para verlas aquí</p>
            <Link to="/catalog">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Explorar Catálogo</span>
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
