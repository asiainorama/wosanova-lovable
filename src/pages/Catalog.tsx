
import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import CategoryFilter from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
        
        // Map Supabase data to AppData format, usando subcategoría como categoría principal
        const fetchedApps: AppData[] = data.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          category: app.subcategory || app.category, // Usar subcategoría como categoría principal
          subcategory: "",
          isAI: app.is_ai,
          created_at: app.created_at,
          updated_at: app.updated_at
        }));
        
        setAllApps(fetchedApps);
        
        // Start prefetching icons for better performance
        prefetchIconsInBatches(fetchedApps);
        
      } catch (error) {
        console.error('Error fetching apps from Supabase:', error);
        toast.error('Error al cargar las aplicaciones');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Prefetch icons in batches for better performance
    const prefetchIconsInBatches = async (apps: AppData[]) => {
      const batchSize = 10; // Process 10 icons at a time
      
      // First prefetch prioritized icons (first visible batch)
      const priorityApps = apps.slice(0, batchSize);
      try {
        await prefetchAppLogos(priorityApps);
        
        // Then process the rest in the background in small batches
        let loadedCount = batchSize;
        
        for (let i = batchSize; i < apps.length; i += batchSize) {
          const batch = apps.slice(i, Math.min(i + batchSize, apps.length));
          
          await new Promise(resolve => setTimeout(resolve, 100));
          await prefetchAppLogos(batch).catch(console.error);
          
          loadedCount += batch.length;
        }
      } catch (error) {
        console.error('Error prefetching app logos:', error);
      }
    };
    
    fetchApps();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'apps'
        }, 
        (payload) => {
          console.log('Change detected in apps:', payload);
          // Reload apps when there are changes
          fetchApps();
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sort apps by name alphabetically
  const sortedApps = useMemo(() => {
    return [...allApps].sort((a, b) => a.name.localeCompare(b.name));
  }, [allApps]);

  // Manejar la búsqueda y filtrado de apps
  useEffect(() => {
    let filtered = [...sortedApps];
    
    // Extraemos términos de búsqueda y categoría seleccionada
    // Ahora la búsqueda se maneja desde el nuevo componente unificado
    
    // Filtrar por categoría seleccionada
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(app => app.category === selectedFilter);
    }
    
    setFilteredApps(filtered);
    setPrefetchStatus('idle');
  }, [selectedFilter, sortedApps]);

  // Manejar búsqueda por nombre o descripción
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    let filtered = [...sortedApps];
    
    // Filtrar por término de búsqueda
    if (term) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(term.toLowerCase()) ||
        app.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Mantener el filtro de categoría si está activo
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(app => app.category === selectedFilter);
    }
    
    setFilteredApps(filtered);
  };

  // Group apps by category for display
  const groupedApps = useMemo(() => {
    const grouped: Record<string, AppData[]> = {};
    
    // Si hay un término de búsqueda, usar las apps filtradas
    const appsToGroup = searchTerm ? filteredApps : 
                        selectedFilter !== 'all' ? filteredApps : sortedApps;
    
    appsToGroup.forEach(app => {
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
  }, [filteredApps, searchTerm, selectedFilter, sortedApps]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title={t('catalog.title') || "Catálogo"} />
      
      {/* Unified search and filter bar */}
      <div className="sticky top-14 z-40 bg-gray-50 dark:bg-gray-900 pt-4 pb-2 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="w-full">
            <CategoryFilter 
              selectedCategory={selectedFilter}
              onCategoryChange={(category) => {
                setSelectedFilter(category);
                // Resetear término de búsqueda al cambiar categoría
                setSearchTerm('');
              }}
            />
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-4 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-r-transparent animate-spin mb-4"></div>
            <p className="text-gray-500">Cargando aplicaciones...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              {searchTerm || selectedFilter !== 'all'
                ? (t('catalog.results') || "Resultados") 
                : ""}
              {selectedFilter !== 'all' && (
                <span>{` > ${selectedFilter}`}</span>
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
                  <div key={category} className="space-y-3 animate-fade-in">
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
