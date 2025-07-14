import React, { useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { useAppLogo } from '@/hooks/useAppLogo';
import { Skeleton } from '@/components/ui/skeleton';
import AppAvatarFallback from '@/components/cards/AvatarFallback';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';

// Define category groups (same as in Catalog.tsx)
interface CategoryGroup {
  name: string;
  displayName: string; // Add display name for translation
  categories: string[];
}

const categoryGroups: CategoryGroup[] = [
  {
    name: "Productivity",
    displayName: "Productividad",
    categories: ["Productividad", "Organización", "Trabajo", "Educación"]
  },
  {
    name: "Entertainment",
    displayName: "Entretenimiento",
    categories: ["Entretenimiento", "Juegos", "Multimedia", "Social"]
  },
  {
    name: "Utilities",
    displayName: "Utilidades",
    categories: ["Utilidades", "Herramientas", "Desarrollo"]
  },
  {
    name: "Lifestyle",
    displayName: "Estilo de vida",
    categories: ["Estilo de vida", "Salud", "Fitness", "Viajes"]
  },
  {
    name: "Finance",
    displayName: "Finanzas",
    categories: ["Finanzas", "Negocios", "Compras"]
  },
  {
    name: "Other",
    displayName: "Otros",
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

// Function to get display name for a group
const getGroupDisplayName = (groupName: string): string => {
  const group = categoryGroups.find(g => g.name === groupName);
  return group ? group.displayName : "Otros";
};

// Create a new component for app list item with proper image handling
const AppListItem = ({ app, onRemove }: { app: any, onRemove: () => void }) => {
  const { iconUrl, imageLoading, imageError, imageRef, handleImageError, handleImageLoad } = useAppLogo(app);

  return (
    <div
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3">
        {imageLoading && (
          <Skeleton className="w-8 h-8 rounded-md" />
        )}
        
        {!imageError ? (
          <img
            ref={imageRef}
            src={iconUrl}
            alt={`${app.name} icon`}
            className={`w-8 h-8 object-contain rounded-md dark:brightness-110 ${imageLoading ? 'hidden' : 'block'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        ) : (
          <AppAvatarFallback 
            appName={app.name}
            className="w-8 h-8 rounded-md"
          />
        )}
        
        <div>
          <h3 className="font-medium text-sm dark:text-white">{app.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{app.category}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const Manage = () => {
  const { favorites, removeFromFavorites } = useAppContext();
  const { t } = useLanguage();
  const { getBackgroundStyle } = useBackground();
  
  // Use the scroll behavior hook instead of manual effect
  useScrollBehavior();
  
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
    <div 
      className="min-h-screen flex flex-col"
      style={getBackgroundStyle()}
    >
      <Header title={t('header.manage') || "Gestionar Apps"} />
      
      <main className="container mx-auto px-4 py-6 flex-1 overflow-y-auto">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 gradient-text">{t('home.myApps') || "Mis Aplicaciones Favoritas"}</h2>
          
          {favorites.length === 0 ? (
            <p className="text-gray-500">{t('home.noApps') || "No hay aplicaciones que mostrar"}</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFavorites).map(([groupName, apps]) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="font-medium text-sm gradient-text">{getGroupDisplayName(groupName)}</h3>
                  {apps.map((app) => (
                    <AppListItem 
                      key={app.id} 
                      app={app} 
                      onRemove={() => removeFromFavorites(app.id)} 
                    />
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
