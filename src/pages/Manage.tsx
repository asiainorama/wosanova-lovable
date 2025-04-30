
import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';

const Manage = () => {
  const { favorites, removeFromFavorites } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Gestionar Apps" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Mis Aplicaciones Favoritas</h2>
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <p className="text-gray-500">No hay aplicaciones que mostrar</p>
            ) : (
              favorites.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <h3 className="font-medium">{app.name}</h3>
                      <p className="text-sm text-gray-500">{app.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromFavorites(app.id)}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Manage;
