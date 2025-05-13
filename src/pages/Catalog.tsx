
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import AppGrid from "@/components/AppGrid";
import { useAppContext } from "@/contexts/AppContext";
import { AppData } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Catalog = () => {
  const { favorites, addToFavorites: addFavorite, removeFromFavorites: removeFavorite, allApps, setAllApps: setApps } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load apps from Supabase
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          console.info(`Loaded apps from Supabase: ${data.length}`);
          // Convert is_ai to isAI in the data to match AppData type
          const convertedData: AppData[] = data.map(app => ({
            id: app.id,
            name: app.name,
            icon: app.icon,
            url: app.url,
            category: app.category,
            subcategory: app.subcategory,
            description: app.description,
            isAI: app.is_ai,
            created_at: app.created_at,
            updated_at: app.updated_at
          }));
          setApps(convertedData);
        }
      } catch (error) {
        console.error('Error loading apps:', error);
        toast.error('Error al cargar aplicaciones');
      } finally {
        // Add small delay to avoid flash of "no apps" message
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };
    
    loadApps();
  }, [setApps]);

  // Filter apps based on search term and category
  const filteredApps = allApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Get all unique categories
  const categories = [...new Set(allApps.map(app => app.category))].sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Catálogo" />
      
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={handleSearch} 
          />
        </div>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategorySelect}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <AppGrid 
            apps={filteredApps}
            showRemove={false}
            showManage={false}
            onShowDetails={undefined}
          />
        )}
      </div>
    </div>
  );
};

export default Catalog;
