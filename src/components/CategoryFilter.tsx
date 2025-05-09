
import React, { useState, useEffect } from 'react';
import { categories } from '@/data/apps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { categoryGroups } from '@/data/apps';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
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
  
  // Función para contar apps por categoría
  const countAppsByCategory = (category: string) => {
    if (category === 'all') {
      return allApps.length;
    }
    
    // Si es un grupo, contar todas las apps en las categorías del grupo
    const isGroup = categoryGroups.some(group => group.name === category);
    
    if (isGroup) {
      const categoriesInGroup = categoryGroups.find(group => group.name === category)?.categories || [];
      return allApps.filter(app => categoriesInGroup.includes(app.category)).length;
    }
    
    // Si es una categoría individual
    return allApps.filter(app => app.category === category).length;
  };
  
  // Obtener categorías que tienen aplicaciones
  const usedCategories = React.useMemo(() => {
    const usedCats = new Set(allApps.map(app => app.category));
    return categories.filter(cat => usedCats.has(cat));
  }, [allApps]);
  
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

  // Función para mostrar los nombres correctos de los grupos de categorías
  const getCategoryGroupName = (groupName: string): string => {
    switch (groupName) {
      case "Productivity": return t('categoryGroup.productivity') || "Productividad";
      case "Entertainment": return t('categoryGroup.entertainment') || "Entretenimiento";
      case "Utilities": return t('categoryGroup.utilities') || "Utilidades";
      case "Lifestyle": return t('categoryGroup.lifestyle') || "Estilo de vida";
      case "Finance": return t('categoryGroup.finance') || "Finanzas";
      default: return groupName;
    }
  };

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-full bg-gray-100 border-none">
        <SelectValue 
          placeholder={`${t('catalog.allCategories')} (${countAppsByCategory('all')})`} 
        />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectItem 
          key="all" 
          value="all"
          className="text-left font-normal"
        >
          {t('catalog.allCategories')} ({countAppsByCategory('all')})
        </SelectItem>
        
        {/* Mostrar grupos de categorías con subcategorías indentadas */}
        {categoryGroups.map((group) => {
          // No mostrar el grupo "Other"
          if (group.name === "Other") return null;
          
          // Filtrar solo las categorías del grupo que tienen aplicaciones
          const categoriesWithApps = group.categories.filter(cat => 
            usedCategories.includes(cat) && countAppsByCategory(cat) > 0
          );
          
          // Solo mostrar grupos que tienen al menos una categoría con aplicaciones
          if (categoriesWithApps.length === 0) return null;
          
          const groupCount = allApps.filter(app => 
            group.categories.includes(app.category)
          ).length;
          
          return (
            <React.Fragment key={group.name}>
              {/* Nombre del grupo con conteo */}
              <SelectItem 
                value={group.name} 
                className="text-left font-semibold border-b"
              >
                {getCategoryGroupName(group.name)} ({groupCount})
              </SelectItem>
              
              {/* Categorías dentro del grupo (indentadas) */}
              {categoriesWithApps.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="text-left pl-6 font-normal"
                >
                  {translateCategory(category)} ({countAppsByCategory(category)})
                </SelectItem>
              ))}
            </React.Fragment>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
