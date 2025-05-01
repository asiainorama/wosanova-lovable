
import React, { useMemo } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Define category groups (same as in Catalog.tsx)
interface CategoryGroup {
  name: string;
  categories: string[];
}

const categoryGroups: CategoryGroup[] = [
  {
    name: "Productivity",
    categories: ["Productividad", "Organización", "Trabajo", "Educación"]
  },
  {
    name: "Entertainment",
    categories: ["Entretenimiento", "Juegos", "Multimedia", "Social"]
  },
  {
    name: "Utilities",
    categories: ["Utilidades", "Herramientas", "Desarrollo"]
  },
  {
    name: "Lifestyle",
    categories: ["Estilo de vida", "Salud", "Fitness", "Viajes"]
  },
  {
    name: "Finance",
    categories: ["Finanzas", "Negocios", "Compras"]
  },
  {
    name: "Other",
    categories: ["Otros", "Arte", "Fotografía", "Música"]
  }
];

// Function to get group for a category
const getCategoryGroup = (category: string): string => {
  for (const group of categoryGroups) {
    if (group.categories.includes(category)) {
      return group.name;
    }
  }
  return "Other";
};

const Manage = () => {
  const { favorites, removeFromFavorites } = useAppContext();
  const { t } = useLanguage();
  
  // Group favorites by category group and sort alphabetically
  const groupedFavorites = useMemo(() => {
    // First sort all favorites by name
    const sortedFavorites = [...favorites].sort((a, b) => a.name.localeCompare(b.name));
    
    // Then group them
    const groups: Record<string, typeof favorites> = {};
    
    sortedFavorites.forEach(app => {
      const groupName = getCategoryGroup(app.category);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(app);
    });
    
    // Sort groups alphabetically by group name
    return Object.keys(groups)
      .sort()
      .reduce((sortedGroups: Record<string, typeof favorites>, groupName) => {
        sortedGroups[groupName] = groups[groupName];
        return sortedGroups;
      }, {});
  }, [favorites]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={t('header.manage') || "Gestionar Apps"} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('home.myApps') || "Mis Aplicaciones Favoritas"}</h2>
          
          {favorites.length === 0 ? (
            <p className="text-gray-500">{t('home.noApps') || "No hay aplicaciones que mostrar"}</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFavorites).map(([groupName, apps]) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">{groupName}</h3>
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={app.icon}
                          alt={`${app.name} icon`}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <h3 className="font-medium text-sm dark:text-white">{app.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromFavorites(app.id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Manage;
