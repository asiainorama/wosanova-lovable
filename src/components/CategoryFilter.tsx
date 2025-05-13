
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  selectedSubcategory?: string | null;
  onSubcategoryChange?: (subcategory: string | null) => void;
  subcategories?: string[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories,
  selectedSubcategory = null,
  onSubcategoryChange = () => {},
}) => {
  const { t, language } = useLanguage();
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [, updateState] = useState<{}>({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [categorySubcategories, setCategorySubcategories] = useState<Record<string, string[]>>({});

  // Función para traducir categorías
  const translateCategory = (category: string) => {
    // Convertir a minúsculas y normalizar el identificador para la traducción
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category; // Si no hay traducción, usar el original
  };
  
  // Obtener todas las apps para calcular los conteos y subcategorías
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
        
        // Organizar subcategorías por categoría
        const subcategoriesByCategory: Record<string, Set<string>> = {};
        fetchedApps.forEach(app => {
          if (app.subcategory && app.subcategory.trim() !== '') {
            if (!subcategoriesByCategory[app.category]) {
              subcategoriesByCategory[app.category] = new Set();
            }
            subcategoriesByCategory[app.category].add(app.subcategory);
          }
        });
        
        // Convertir sets a arrays ordenados
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

  const getDisplayText = () => {
    if (selectedCategory && selectedSubcategory) {
      return `${translateCategory(selectedCategory)} > ${selectedSubcategory}`;
    } else if (selectedCategory) {
      return translateCategory(selectedCategory);
    } else {
      return t('catalog.allCategories') || 'Todas las categorías';
    }
  };

  const handleCategorySelect = (category: string | null, subcategory: string | null = null) => {
    onCategoryChange(category);
    onSubcategoryChange(subcategory);
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md border-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
          align="start"
        >
          <DropdownMenuLabel>{t('catalog.filterByCategory')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* All Categories option */}
          <DropdownMenuItem 
            onClick={() => handleCategorySelect(null, null)}
            className={cn("cursor-pointer", 
              (!selectedCategory && !selectedSubcategory) && "bg-gray-100 dark:bg-gray-700"
            )}
          >
            <span className="flex items-center">
              {(!selectedCategory && !selectedSubcategory) && <Check className="h-4 w-4 mr-2" />}
              {t('catalog.allCategories')}
            </span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Categories with subcategories */}
          {usedCategories.map((category) => {
            const hasSubcategories = categorySubcategories[category]?.length > 0;
            
            if (hasSubcategories) {
              return (
                <DropdownMenuSub key={category}>
                  <DropdownMenuSubTrigger
                    className={cn("cursor-pointer", 
                      (selectedCategory === category && !selectedSubcategory) && "bg-gray-100 dark:bg-gray-700"
                    )}
                  >
                    <span className="flex items-center">
                      {(selectedCategory === category && !selectedSubcategory) && <Check className="h-4 w-4 mr-2" />}
                      {translateCategory(category)}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    {/* Option for the main category */}
                    <DropdownMenuItem 
                      onClick={() => handleCategorySelect(category, null)} 
                      className={cn("cursor-pointer", 
                        (selectedCategory === category && !selectedSubcategory) && "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      <span className="flex items-center">
                        {(selectedCategory === category && !selectedSubcategory) && <Check className="h-4 w-4 mr-2" />}
                        {t('catalog.allInCategory', { category: translateCategory(category) }) || `Todas en ${translateCategory(category)}`}
                      </span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Options for subcategories */}
                    {categorySubcategories[category].map((subcat) => (
                      <DropdownMenuItem 
                        key={`${category}-${subcat}`} 
                        onClick={() => handleCategorySelect(category, subcat)}
                        className={cn("cursor-pointer", 
                          (selectedCategory === category && selectedSubcategory === subcat) && "bg-gray-100 dark:bg-gray-700"
                        )}
                      >
                        <span className="flex items-center">
                          {(selectedCategory === category && selectedSubcategory === subcat) && <Check className="h-4 w-4 mr-2" />}
                          {subcat}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            } else {
              // Categories without subcategories
              return (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => handleCategorySelect(category, null)}
                  className={cn("cursor-pointer", 
                    (selectedCategory === category) && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <span className="flex items-center">
                    {(selectedCategory === category) && <Check className="h-4 w-4 mr-2" />}
                    {translateCategory(category)}
                  </span>
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CategoryFilter;
