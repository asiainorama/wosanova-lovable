
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import AppGrid from "@/components/AppGrid";
import { useAppContext } from "@/contexts/AppContext";
import { AppData } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowDownAZ } from "lucide-react";

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
  const { favorites, addToFavorites, removeFromFavorites, allApps, setAllApps } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps(setAllApps, setLoading);
  }, [setAllApps]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  const filteredApps = useMemo(() => {
    return allApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || app.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || app.subcategory === selectedSubcategory;
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [allApps, searchTerm, selectedCategory, selectedSubcategory]);

  // Group apps by category
  const appsByCategory = useMemo(() => {
    const grouped: Record<string, AppData[]> = {};
    
    // Filter and sort apps
    const sorted = [...filteredApps].sort((a, b) => a.name.localeCompare(b.name));
    
    // Group into categories
    sorted.forEach(app => {
      const category = app.category || 'Sin categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(app);
    });
    
    return grouped;
  }, [filteredApps]);

  // Get a sorted list of categories 
  const categories = [...new Set(allApps.map(app => app.category))].sort();
  
  // Get subcategories for the selected category
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return [...new Set(allApps
      .filter(app => app.category === selectedCategory && app.subcategory)
      .map(app => app.subcategory))]
      .filter(Boolean)
      .sort();
  }, [allApps, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Catálogo" />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-3/5">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
          </div>
          <div className="md:w-2/5">
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
              categories={categories}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={setSelectedSubcategory}
              subcategories={subcategories}
            />
          </div>
        </div>
        
        {loading ? (
          <LoadingIndicator />
        ) : (
          <div className="space-y-8">
            {Object.keys(appsByCategory).length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron aplicaciones</p>
              </div>
            ) : (
              Object.entries(appsByCategory)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .map(([category, apps]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{category}</h2>
                      <ArrowDownAZ className="h-4 w-4 text-gray-500" />
                    </div>
                    <AppGrid 
                      apps={apps}
                      showRemove={false}
                      showManage={false}
                      onShowDetails={undefined}
                    />
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted Components
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-64">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

export default Catalog;
