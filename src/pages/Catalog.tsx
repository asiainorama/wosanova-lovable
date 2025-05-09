
import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { Input } from '@/components/ui/input';
import { Search, X, FileDown } from 'lucide-react';
import { AppData, categoryGroups } from '@/data/apps';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import CategoryFilter from '@/components/CategoryFilter';
import { exportAppsToExcel } from '@/services/ExportService';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Traducir los nombres de grupos de categorías
const translateCategoryGroupName = (groupName: string, t: (key: string) => string): string => {
  switch (groupName) {
    case "Productivity": return t('categoryGroup.productivity') || "Productividad";
    case "Entertainment": return t('categoryGroup.entertainment') || "Entretenimiento";
    case "Utilities": return t('categoryGroup.utilities') || "Utilidades";
    case "Lifestyle": return t('categoryGroup.lifestyle') || "Estilo de vida";
    case "Finance": return t('categoryGroup.finance') || "Finanzas";
    default: return groupName;
  }
};

const Catalog = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredApps, setFilteredApps] = useState<AppData[]>([]);
  const [prefetchStatus, setPrefetchStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch apps from Supabase
  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*');

        if (error) throw error;
        
        // Map Supabase data to AppData format
        const fetchedApps: AppData[] = data.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          category: app.category,
          isAI: app.is_ai,
          created_at: app.created_at,
          updated_at: app.updated_at
        }));
        
        setAllApps(fetchedApps);
      } catch (error) {
        console.error('Error fetching apps from Supabase:', error);
        toast.error('Error al cargar las aplicaciones');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApps();
  }, []);

  // Sort apps by name alphabetically
  const sortedApps = useMemo(() => {
    return [...allApps].sort((a, b) => a.name.localeCompare(b.name));
  }, [allApps]);

  // Filter apps based on search term and selected filter
  useEffect(() => {
    let filtered = [...sortedApps];
    
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
    
    // Reset prefetch status to idle to trigger a new prefetch when filter changes
    setPrefetchStatus('idle');
  }, [searchTerm, selectedFilter, sortedApps]);

  // Prefetch logos when the catalog page loads or when filtered apps change
  useEffect(() => {
    const prefetchIcons = async () => {
      if (prefetchStatus !== 'idle' || !filteredApps.length) return;
      
      setPrefetchStatus('loading');
      
      // Start with visible apps (first 20 or so)
      const visibleApps = filteredApps.slice(0, 20);
      await prefetchAppLogos(visibleApps);
      
      // Then process the rest in the background
      setTimeout(async () => {
        const remainingApps = allApps.filter(app => 
          !visibleApps.some(visibleApp => visibleApp.id === app.id)
        );
        await prefetchAppLogos(remainingApps);
        setPrefetchStatus('complete');
      }, 2000);
    };
    
    prefetchIcons();
  }, [allApps, filteredApps, prefetchStatus]);

  // Group apps by category for display
  const groupedApps = useMemo(() => {
    const grouped: Record<string, AppData[]> = {};
    
    filteredApps.forEach(app => {
      if (!grouped[app.category]) {
        grouped[app.category] = [];
      }
      grouped[app.category].push(app);
    });
    
    // Sort categories alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((result, category) => {
        // Sort apps within each category alphabetically
        result[category] = grouped[category].sort((a, b) => a.name.localeCompare(b.name));
        return result;
      }, {} as Record<string, AppData[]>);
  }, [filteredApps]);

  // Función para manejar la exportación
  const handleExport = () => {
    exportAppsToExcel(allApps, 'catalogo-aplicaciones');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title={t('catalog.title') || "Catálogo"} />
      
      {/* Fixed search/filter bar - optimized for mobile */}
      <div className="sticky top-14 z-40 bg-gray-50 dark:bg-gray-900 pt-4 pb-2 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('catalog.search') || "Buscar..."}
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
            
            {/* Utilizamos el componente CategoryFilter mejorado */}
            <div className="w-full max-w-[220px]">
              <CategoryFilter 
                selectedCategory={selectedFilter}
                onCategoryChange={setSelectedFilter}
              />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={handleExport}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden md:inline">Exportar</span>
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-4 flex-1">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Cargando aplicaciones...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              {searchTerm || selectedFilter !== 'all'
                ? (t('catalog.results') || "Resultados") 
                : ""}
              {selectedFilter !== 'all' && (
                <span>
                  {` > ${
                    categoryGroups.some(group => group.name === selectedFilter)
                      ? translateCategoryGroupName(selectedFilter, t)
                      : selectedFilter
                  }`}
                </span>
              )}
            </h3>
            
            {/* Display apps grouped by category */}
            {Object.keys(groupedApps).length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedApps).map(([category, apps]) => (
                  <div key={category} className="space-y-3">
                    <h2 className="text-xl font-semibold border-b pb-2 gradient-text">
                      {category}
                    </h2>
                    <AppGrid 
                      apps={apps}
                      showManage={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;
