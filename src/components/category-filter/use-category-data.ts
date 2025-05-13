
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

export const useCategoryData = () => {
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [categorySubcategories, setCategorySubcategories] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase.from('apps').select('*');
        if (error) throw error;
        
        // Map the data from Supabase to the format AppData
        const fetchedApps: AppData[] = data.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          category: app.category,
          subcategory: app.subcategory || "",
          isAI: app.is_ai,
          created_at: app.created_at,
          updated_at: app.updated_at
        }));
        
        setAllApps(fetchedApps);
        
        // Organize subcategories by category
        const subcategoriesByCategory: Record<string, Set<string>> = {};
        fetchedApps.forEach(app => {
          if (app.subcategory && app.subcategory.trim() !== '') {
            if (!subcategoriesByCategory[app.category]) {
              subcategoriesByCategory[app.category] = new Set();
            }
            subcategoriesByCategory[app.category].add(app.subcategory);
          }
        });
        
        // Convert sets to arrays sorted
        const formattedSubcategories: Record<string, string[]> = {};
        Object.keys(subcategoriesByCategory).forEach(category => {
          formattedSubcategories[category] = Array.from(subcategoriesByCategory[category]).sort();
        });
        
        setCategorySubcategories(formattedSubcategories);
      } catch (error) {
        console.error('Error fetching apps for category filter:', error);
      }
    };

    fetchApps();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('category-filter-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'apps'
        }, 
        () => {
          fetchApps();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Get used categories
  const getUsedCategories = (categories: string[]) => {
    const usedCats = new Set(allApps.map(app => app.category));
    return categories.filter(cat => usedCats.has(cat)).sort();
  };

  return {
    allApps,
    categorySubcategories,
    getUsedCategories
  };
};
