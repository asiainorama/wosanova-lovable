
import { AppData } from '@/data/types';

export interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  selectedSubcategory?: string | null;
  onSubcategoryChange?: (subcategory: string | null) => void;
  subcategories?: string[];
}

export interface CategorySubcategories {
  [category: string]: string[];
}
