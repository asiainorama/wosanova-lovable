
import React from 'react';
import { 
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryTranslator } from './category-translator';
import CategoryMenuItem from './CategoryMenuItem';

interface SubcategoryMenuProps {
  category: string;
  subcategories: string[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (category: string, subcategory: string) => void;
}

const SubcategoryMenu: React.FC<SubcategoryMenuProps> = ({
  category,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const { translateCategory } = useCategoryTranslator();
  const isSelected = selectedCategory === category && !selectedSubcategory;
  
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={cn("cursor-pointer", 
          isSelected && "bg-gray-100 dark:bg-gray-700"
        )}
      >
        <span className="flex items-center">
          {isSelected && <Check className="h-4 w-4 mr-2" />}
          {translateCategory(category)}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        {/* Option for the main category */}
        <CategoryMenuItem 
          category={category}
          isSelected={isSelected}
          onClick={() => onCategorySelect(category)}
          customLabel={`Todas en ${translateCategory(category)}`}
        />
        
        <DropdownMenuSeparator />
        
        {/* Options for subcategories */}
        {subcategories.map((subcat) => (
          <DropdownMenuItem 
            key={`${category}-${subcat}`} 
            onClick={() => onSubcategorySelect(category, subcat)}
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
};

export default SubcategoryMenu;
