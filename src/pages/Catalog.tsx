
import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import SearchBar from '@/components/SearchBar';
import { AppData, categoryGroups } from '@/data/apps';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import CategoryFilter from '@/components/CategoryFilter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Traducir los nombres de grupos de categorías
const translateCategoryGroupName = (groupName: string): string => {
  switch (groupName) {
    case "Productivity": return "Productividad";
    case "Entertainment": return "Entretenimiento";
    case "Utilities": return "Utilidades";
    case "Lifestyle": return "Estilo de vida";
    case "Finance": return "Finanzas";
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
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

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
          subcategory: app.subcategory || '', // Include subcategory
          isAI: app.is_ai,
          created_at: app.created_at,
          updated_at: app.updated_at
        }));
        
        // Extract all unique subcategories
        const uniqueSubcategories: Set<string> = new Set();
        fetchedApps.forEach(app => {
          if (app.subcategory && app.subcategory.trim() !== '') {
            uniqueSubcategories.add(app.subcategory);
          }
        });
        
        setSubcategories(Array.from(uniqueSubcategories).sort());
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
      await prefetchAppLogos(priorityApps);
      
      // Then process the rest in the background in small batches
      for (let i = batchSize; i < apps.length; i += batchSize) {
        const batch = apps.slice(i, Math.min(i + batchSize, apps.length));
        setTimeout(() => {
          prefetchAppLogos(batch).catch(console.error);
        }, (i - batchSize) * 50); // Stagger the requests to avoid overwhelming the network
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

  // Filter apps based on search term, selected category and subcategory
  useEffect(() => {
    let filtered = [...sortedApps];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category/group
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
    
    // Filter by subcategory if selected
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(app => app.subcategory === selectedSubcategory);
    }
    
    setFilteredApps(filtered);
    
    // Reset prefetch status to idle to trigger a new prefetch when filter changes
    setPrefetchStatus('idle');
  }, [searchTerm, selectedFilter, sortedApps, selectedSubcategory]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title={t('catalog.title') || "Catálogo"} />
      
      {/* Fixed search/filter bar - optimized for mobile */}
      <div className="sticky top-14 z-40 bg-gray-50 dark:bg-gray-900 pt-4 pb-2 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
              />
            </div>
            
            <div className="w-full md:max-w-[220px]">
              <CategoryFilter 
                selectedCategory={selectedFilter}
                onCategoryChange={setSelectedFilter}
              />
            </div>
          </div>
          
          {/* Add subcategory filter when subcategories are available */}
          {subcategories.length > 0 && (
            <div className="mt-3">
              <select 
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                <option value="all">Todas las subcategorías</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              {searchTerm || selectedFilter !== 'all' || selectedSubcategory !== 'all'
                ? (t('catalog.results') || "Resultados") 
                : ""}
              {selectedFilter !== 'all' && (
                <span>
                  {` > ${
                    categoryGroups.some(group => group.name === selectedFilter)
                      ? translateCategoryGroupName(selectedFilter)
                      : selectedFilter
                  }`}
                </span>
              )}
              {selectedSubcategory !== 'all' && (
                <span> > {selectedSubcategory}</span>
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
