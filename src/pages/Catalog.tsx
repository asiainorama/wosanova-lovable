
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import AppDetails from '@/components/AppDetails';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/apps';
import { Search, X, List, Grid } from 'lucide-react';
import { AppData } from '@/data/apps';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/LanguageContext';

// Definimos los grupos de categorías
const categoryGroups = {
  'Productividad': ['Productividad', 'Herramientas', 'Organización', 'Documentos', 'Gestión', 'Business'],
  'Comunicación': ['Comunicación', 'Social', 'Email', 'Chat', 'Mensajería'],
  'Multimedia': ['Multimedia', 'Vídeo', 'Audio', 'Imágenes', 'Diseño', 'Gráficos'],
  'Educación': ['Educación', 'Aprendizaje', 'Idiomas', 'Conocimiento'],
  'Tecnología': ['Desarrollo', 'Programación', 'Tecnología', 'IA', 'Code', 'Tech'],
  'Entretenimiento': ['Juegos', 'Ocio', 'Entretenimiento', 'Música'],
  'Finanzas': ['Finanzas', 'Economía', 'Banca', 'Inversión'],
  'Otros': ['Otros', 'Viajes', 'Salud', 'Compras', 'Estilo de vida'] 
};

// Función para obtener el grupo de una categoría
const getCategoryGroup = (category: string) => {
  for (const [group, cats] of Object.entries(categoryGroups)) {
    if (cats.includes(category)) {
      return group;
    }
  }
  return 'Otros';
};

// Obtenemos los nombres de los grupos únicos
const uniqueGroups = Object.keys(categoryGroups);

const Catalog = () => {
  const { allApps } = useAppContext();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filteredApps, setFilteredApps] = useState(allApps);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [featuredApps, setFeaturedApps] = useState<AppData[]>([]);
  const [listView, setListView] = useState(false); // Changed to false to default to grid view

  // Filter apps based on search term and category
  useEffect(() => {
    let filtered = [...allApps];
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'Todas') {
      if (uniqueGroups.includes(selectedCategory)) {
        // Si es un grupo, filtramos por todas las categorías que pertenecen a ese grupo
        const categoriesInGroup = categoryGroups[selectedCategory as keyof typeof categoryGroups];
        filtered = filtered.filter(app => categoriesInGroup.includes(app.category));
      } else {
        // Filtrado por categoría específica
        filtered = filtered.filter(app => app.category === selectedCategory);
      }
    }
    
    setFilteredApps(filtered);
  }, [searchTerm, selectedCategory, allApps]);

  // Set featured apps - one from each category group
  useEffect(() => {
    const featured = uniqueGroups
      .map(group => {
        const categoriesInGroup = categoryGroups[group as keyof typeof categoryGroups];
        const appsInGroup = allApps.filter(app => categoriesInGroup.includes(app.category));
        
        // Find apps with icons for this group
        const appsWithIcons = appsInGroup.filter(app => 
          app.icon && !app.icon.includes('placeholder')
        );
        
        // If we have apps with icons, use one of those, otherwise get any app from this group
        if (appsWithIcons.length > 0) {
          return appsWithIcons[0];
        } else if (appsInGroup.length > 0) {
          return appsInGroup[0];
        }
        return null;
      })
      .filter(Boolean) as AppData[];
    
    setFeaturedApps(featured.slice(0, 4)); // Limit to 4 featured apps
  }, [allApps]);

  const handleShowDetails = (app: AppData) => {
    setSelectedApp(app);
  };

  const toggleViewMode = () => {
    setListView(!listView);
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
            
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-800 border-none dark:text-white">
                  <SelectValue placeholder={t('catalog.category') || "Categoría"} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="Todas" className="dark:text-white">
                    {t('catalog.allCategories') || "Todas las categorías"}
                  </SelectItem>
                  
                  {/* Añadimos los grupos como opciones separadas */}
                  {uniqueGroups.map((group) => (
                    <SelectItem key={group} value={group} className="dark:text-white font-semibold">
                      {group}
                    </SelectItem>
                  ))}
                  
                  {/* Mantenemos las categorías originales para selecciones más específicas */}
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="dark:text-white pl-6">
                      {category} ({getCategoryGroup(category)})
                    </SelectItem>
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
        
        {featuredApps.length > 0 && !searchTerm && selectedCategory === 'Todas' && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 dark:text-white">{t('catalog.featured') || "Destacadas"}</h3>
            <AppGrid 
              apps={featuredApps} 
              showManage={true}
              onShowDetails={handleShowDetails}
              isLarge={true}
              listView={false}
            />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-4 dark:text-white">
            {searchTerm || selectedCategory !== 'Todas' 
              ? (t('catalog.results') || "Resultados") 
              : (t('catalog.allApps') || "Todas las aplicaciones")}
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
