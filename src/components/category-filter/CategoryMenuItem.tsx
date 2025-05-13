
import React from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryTranslator } from './category-translator';

interface CategoryMenuItemProps {
  category: string;
  isSelected: boolean;
  onClick: () => void;
  customLabel?: string;
}

const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({ 
  category, 
  isSelected, 
  onClick, 
  customLabel 
}) => {
  const { translateCategory } = useCategoryTranslator();
  
  return (
    <DropdownMenuItem 
      onClick={onClick}
      className={cn(
        "cursor-pointer", 
        isSelected && "bg-gray-100 dark:bg-gray-700"
      )}
    >
      <span className="flex items-center">
        {isSelected && <Check className="h-4 w-4 mr-2" />}
        {customLabel || translateCategory(category)}
      </span>
    </DropdownMenuItem>
  );
};

export default CategoryMenuItem;
