import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { CatalogService } from '@/services/CatalogService';
import { AppData } from '@/data/types';
import { toast } from 'sonner';

export const useCatalogLogic = () => {
  const { allApps, setAllApps } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup catalog-specific scroll behavior
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

  // Load apps from Supabase
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);
        const apps = await CatalogService.fetchApps();
        setAllApps(apps);
      } catch (error) {
        console.error('Error loading apps:', error);
        toast.error('Error al cargar aplicaciones');
      } finally {
        setTimeout(() => setLoading(false), 200);
      }
    };

    loadApps();
  }, [setAllApps]);

  // Filter apps based on search and category
  const filteredApps = CatalogService.filterApps(allApps, searchTerm, selectedCategory);

  // Get sorted apps or grouped apps based on category selection
  const processedApps = selectedCategory 
    ? CatalogService.groupAppsByCategory(filteredApps)
    : [...filteredApps].sort((a, b) => a.name.localeCompare(b.name));

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    loading,
    filteredApps,
    processedApps
  };
};