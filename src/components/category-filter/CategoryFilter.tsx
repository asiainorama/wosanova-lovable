
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryFilterProps } from './types';
import { useCategoryData } from './use-category-data';
import { useCategoryTranslator } from './category-translator';
import CategoryMenuItem from './CategoryMenuItem';
import SubcategoryMenu from './SubcategoryMenu';

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories,
  selectedSubcategory = null,
  onSubcategoryChange = () => {},
}) => {
  const { t, language } = useLanguage();
  const { categorySubcategories, getUsedCategories } = useCategoryData();
  const [, updateState] = useState<{}>({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const { translateCategory } = useCategoryTranslator();
  
  // Used categories
  const usedCategories = React.useMemo(() => {
    return getUsedCategories(categories);
  }, [categories, getUsedCategories]);
  
  // Respond to language changes
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

  // Fix: Remove the subcategory parameter that's causing the TS2554 error
  const handleCategorySelect = (category: string | null) => {
    onCategoryChange(category);
    onSubcategoryChange(null);
  };

  const handleSubcategorySelect = (category: string, subcategory: string) => {
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
          <CategoryMenuItem 
            category="all"
            isSelected={!selectedCategory && !selectedSubcategory}
            onClick={() => handleCategorySelect(null)}
            customLabel={t('catalog.allCategories')}
          />
          
          <DropdownMenuSeparator />
          
          {/* Categories with subcategories */}
          {usedCategories.map((category) => {
            const hasSubcategories = categorySubcategories[category]?.length > 0;
            
            if (hasSubcategories) {
              return (
                <SubcategoryMenu
                  key={category}
                  category={category}
                  subcategories={categorySubcategories[category]}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              );
            } else {
              // Categories without subcategories
              return (
                <CategoryMenuItem 
                  key={category}
                  category={category}
                  isSelected={selectedCategory === category}
                  onClick={() => handleCategorySelect(category)}
                />
              );
            }
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CategoryFilter;
