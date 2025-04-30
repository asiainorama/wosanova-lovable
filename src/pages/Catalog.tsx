
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import AppDetails from '@/components/AppDetails';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/apps';
import { Search, X, List, Grid } from 'lucide-react';
import { AppData } from '@/data/apps';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/LanguageContext';

// Define category groups
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

const Catalog = () => {
  const { allApps } = useAppContext();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredApps, setFilteredApps] = useState(allApps);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [listView, setListView] = useState(false);

  // Filter apps based on search term and selected filter
  useEffect(() => {
    let filtered = [...allApps];
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFilter !== 'all') {
      // Check if selected filter is a group or a category
      const isGroup = categoryGroups.some(group => group.name === selectedFilter);
      
      if (isGroup) {
        // Filter by group
        const categoriesInGroup = categoryGroups.find(group => group.name === selectedFilter)?.categories || [];
        filtered = filtered.filter(app => categoriesInGroup.includes(app.category));
      } else {
        // Filter by specific category
        filtered = filtered.filter(app => app.category === selectedFilter);
      }
    }
    
    setFilteredApps(filtered);
  }, [searchTerm, selectedFilter, allApps]);

  const handleShowDetails = (app: AppData) => {
    setSelectedApp(app);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title={t('catalog.title') || "Catálogo"} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6 space-y-4">
          <h2 className="text-xl font-semibold dark:text-white">{t('catalog.applications') || "Aplicaciones"}</h2>
          
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('catalog.search') || "Buscar aplicaciones..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 w-full bg-gray-100 dark:bg-gray-800 border-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Unified Category Filter */}
            <div className="w-full sm:w-64">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-800 border-none dark:text-white">
                  <SelectValue placeholder={t('catalog.filter') || "Filtrar por categoría"} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white">
                    {t('catalog.allCategories') || "Todas las categorías"}
                  </SelectItem>
                  
                  {/* Group categories in the dropdown */}
                  {categoryGroups.map((group) => (
                    <SelectGroup key={group.name}>
                      <SelectItem value={group.name} className="dark:text-white font-semibold">
                        {group.name}
                      </SelectItem>
                      {group.categories.map((category) => (
                        <SelectItem key={category} value={category} className="dark:text-white pl-6">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Toggle 
                pressed={listView} 
                onPressedChange={setListView}
                aria-label={t('catalog.listView') || "Toggle list view"}
                className="bg-gray-100 dark:bg-gray-800 border-none dark:text-white dark:data-[state=off]:text-gray-400"
              >
                <List className="h-4 w-4" />
              </Toggle>
              <Toggle 
                pressed={!listView} 
                onPressedChange={(pressed) => setListView(!pressed)}
                aria-label={t('catalog.gridView') || "Toggle grid view"}
                className="bg-gray-100 dark:bg-gray-800 border-none ml-2 dark:text-white dark:data-[state=off]:text-gray-400"
              >
                <Grid className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 dark:text-white">
            {searchTerm || selectedFilter !== 'all'
              ? (t('catalog.results') || "Resultados") 
              : (t('catalog.allApps') || "Todas las aplicaciones")}
            {selectedFilter !== 'all' && ` > ${selectedFilter}`}
          </h3>
          <AppGrid 
            apps={filteredApps}
            showManage={true}
            onShowDetails={handleShowDetails}
            listView={listView}
          />
        </div>

        <AppDetails 
          app={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      </main>
    </div>
  );
};

export default Catalog;
