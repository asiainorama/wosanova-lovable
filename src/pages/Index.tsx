
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

const Index = () => {
  const { favorites } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="AI App Garden" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mis Aplicaciones</h2>
          <Link to="/catalog">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Explorar Catálogo</span>
            </Button>
          </Link>
        </div>
        
        {favorites.length > 0 ? (
          <AppGrid apps={favorites} showRemove={true} />
        ) : (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No tienes aplicaciones añadidas</h3>
            <p className="text-gray-500 mb-6">Agrega aplicaciones desde el catálogo para verlas aquí</p>
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
