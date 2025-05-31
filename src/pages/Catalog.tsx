import { useState, useEffect } from "react";
import Header from "@/components/Header";
import UnifiedSearchBar from "@/components/UnifiedSearchBar";
import AppGrid from "@/components/AppGrid";
import { useAppContext } from "@/contexts/AppContext";
import { AppData } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Filter apps by search term and category
  const filteredApps = allApps.filter(app => {
    const matchesSearch = searchTerm.trim() 
      ? app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group apps by category
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

  const categories = [...new Set(allApps.map(app => app.category))].sort();

  const totalPages = Math.ceil(Object.keys(groupedApps).length / itemsPerPage);
  const visibleCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div id="catalog-container" className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto flex flex-col">
      {/* Header y barra de búsqueda como un único bloque */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800/30 shadow-lg shadow-black/5 dark:shadow-black/20">
        <Header title="Catálogo" />
        
        {/* Barra de búsqueda integrada sin separación */}
        <div className="container max-w-7xl mx-auto px-4 pb-4">
          <UnifiedSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingIndicator />
        ) : visibleCategories.length > 0 ? (
          <>
            {visibleCategories.map(category => (
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

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                    
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
