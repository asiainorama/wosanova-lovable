
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AppGrid from "@/components/AppGrid";
import { useAppContext } from "@/contexts/AppContext";
import { AppData } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

// Utility functions
const mapAppData = (data: any[]): AppData[] => 
  data.map(app => ({
    id: app.id,
    name: app.name,
    icon: app.icon,
    url: app.url,
    category: app.category,
    subcategory: app.subcategory,
    description: app.description,
    isAI: app.is_ai,
    created_at: app.created_at,
    updated_at: app.updated_at,
  }));

const fetchApps = async (setApps: (apps: AppData[]) => void, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('name');

    if (error) throw error;

    if (data) {
      console.info(`Loaded apps from Supabase: ${data.length}`);
      const convertedData = mapAppData(data);
      setApps(convertedData);
    }
  } catch (error) {
    console.error('Error loading apps:', error);
    toast.error('Error al cargar aplicaciones');
  } finally {
    setTimeout(() => setLoading(false), 200); // Avoid flash of "no apps" message
  }
};

const Catalog = () => {
  const { favorites, allApps, setAllApps } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useScrollBehavior(); // Aplicar comportamiento de scroll adecuado

  // Forzar comportamiento vertical para esta página específica
  useEffect(() => {
    const catalogElement = document.getElementById('catalog-container');
    if (catalogElement) {
      catalogElement.style.height = '100vh';
      catalogElement.style.overflowY = 'auto';
      catalogElement.style.overflowX = 'hidden';
    }
    
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.removeProperty('overflowY');
      document.body.style.removeProperty('overflowX');
    };
  }, []);

  useEffect(() => {
    fetchApps(setAllApps, setLoading);
  }, [setAllApps]);

  // Filter apps by search term and category
  const filteredApps = allApps.filter(app => {
    const matchesSearch = searchTerm.trim() 
      ? app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // If no category is selected, show all apps sorted A-Z without grouping
  if (!selectedCategory) {
    const sortedApps = [...filteredApps].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div id="catalog-container" className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto flex flex-col">
        {/* Header with integrated search */}
        <div className="sticky top-0 z-50">
          <Header 
            title="Catálogo"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 container max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <LoadingIndicator />
          ) : sortedApps.length > 0 ? (
            <AppGrid 
              apps={sortedApps}
              showRemove={false}
              showManage={false}
              onShowDetails={undefined}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm.trim() 
                  ? `No se encontraron aplicaciones que coincidan con "${searchTerm}"`
                  : "No hay aplicaciones que coincidan con los criterios de búsqueda"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group apps by category when a specific category is selected
  const groupedApps: Record<string, AppData[]> = {};
  
  filteredApps.forEach(app => {
    if (!groupedApps[app.category]) {
      groupedApps[app.category] = [];
    }
    groupedApps[app.category].push(app);
  });
  
  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedApps).sort();
  
  // Sort apps within each category alphabetically
  sortedCategories.forEach(category => {
    groupedApps[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div id="catalog-container" className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto flex flex-col">
      {/* Header with integrated search */}
      <div className="sticky top-0 z-50">
        <Header 
          title="Catálogo"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingIndicator />
        ) : sortedCategories.length > 0 ? (
          <>
            {sortedCategories.map(category => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-3 dark:text-white">{category}</h2>
                <Separator className="mb-4" />
                <AppGrid 
                  apps={groupedApps[category]}
                  showRemove={false}
                  showManage={false}
                  onShowDetails={undefined}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm.trim() 
                ? `No se encontraron aplicaciones que coincidan con "${searchTerm}"`
                : selectedCategory 
                  ? `No hay aplicaciones en la categoría "${selectedCategory}"`
                  : "No hay aplicaciones que coincidan con los criterios de búsqueda"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted Component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-64">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

export default Catalog;
