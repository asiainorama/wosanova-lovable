
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories 
}) => {
  const { t, language } = useLanguage();
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [, updateState] = useState<{}>({});
  const forceUpdate = React.useCallback(() => updateState({}), []);

  // Función para traducir categorías
  const translateCategory = (category: string) => {
    // Convertir a minúsculas y normalizar el identificador para la traducción
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category; // Si no hay traducción, usar el original
  };
  
  // Obtener todas las apps para calcular los conteos
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase.from('apps').select('*');
        if (error) throw error;
        
        // Mapear los datos de Supabase al formato AppData
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
      } catch (error) {
        console.error('Error fetching apps for category filter:', error);
      }
    };

    fetchApps();
    
    // Suscribirse a cambios en tiempo real para actualizar los conteos
    const channel = supabase
      .channel('category-filter-changes')
      .on('postgres_changes', 
        {
          event: '*', // Escuchar INSERT, UPDATE y DELETE
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
  
  // Obtener categorías que tienen aplicaciones
  const usedCategories = React.useMemo(() => {
    const usedCats = new Set(allApps.map(app => app.category));
    return categories.filter(cat => usedCats.has(cat)).sort();
  }, [allApps, categories]);
  
  // Responder a los cambios de idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log("CategoryFilter detected language change:", language);
      forceUpdate();
    };
    
    document.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [language, forceUpdate]);

  return (
    <div className="space-y-2">
      <Select 
        value={selectedCategory || ""} 
        onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full bg-gray-100 border-none text-gray-500">
          <SelectValue 
            placeholder={t('form.filterByCategory')}
          />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectItem 
            key="all" 
            value="all"
            className="text-left font-normal"
          >
            {t('catalog.allCategories')}
          </SelectItem>
          
          {/* Mostrar categorías ordenadas alfabéticamente */}
          {usedCategories.map((category) => (
            <SelectItem 
              key={category}
              value={category}
              className="text-left font-normal"
            >
              {translateCategory(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;
