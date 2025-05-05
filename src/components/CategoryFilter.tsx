
import React, { useState, useEffect } from 'react';
import { categories } from '@/data/apps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { categoryGroups } from '@/data/apps';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const { t, language } = useLanguage();
  const { allApps } = useAppContext();
  const [, updateState] = useState<{}>({});
  const forceUpdate = React.useCallback(() => updateState({}), []);

  // Función para traducir categorías
  const translateCategory = (category: string) => {
    // Convertir a minúsculas y normalizar el identificador para la traducción
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category; // Si no hay traducción, usar el original
  };
  
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

  // Función para traducir nombres de grupos de categorías
  const translateCategoryGroupName = (groupName: string): string => {
    switch (groupName) {
      case "Productivity": return t('categoryGroup.productivity') || "Productividad";
      case "Entertainment": return t('categoryGroup.entertainment') || "Entretenimiento";
      case "Utilities": return t('categoryGroup.utilities') || "Utilidades";
      case "Lifestyle": return t('categoryGroup.lifestyle') || "Estilo de vida";
      case "Finance": return t('categoryGroup.finance') || "Finanzas";
      case "Other": return t('categoryGroup.other') || "Otros";
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
                {translateCategoryGroupName(group.name)} ({groupCount})
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
