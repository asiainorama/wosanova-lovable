
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface UnifiedSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para traducir categorías
  const translateCategory = (category: string) => {
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category;
  };

  // Lista de categorías con "Todas las categorías" al inicio
  const categoryOptions = [
    { value: null, label: t('catalog.allCategories') },
    ...categories.map(cat => ({ value: cat, label: translateCategory(cat) }))
  ];

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHoveredIndex(prev => 
            prev < categoryOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHoveredIndex(prev => 
            prev > 0 ? prev - 1 : categoryOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (hoveredIndex >= 0 && hoveredIndex < categoryOptions.length) {
            const selectedOption = categoryOptions[hoveredIndex];
            onCategoryChange(selectedOption.value);
            setIsOpen(false);
            inputRef.current?.blur();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hoveredIndex, categoryOptions, onCategoryChange]);

  const handleInputClick = () => {
    setIsOpen(true);
    setHoveredIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Si está escribiendo, cerrar dropdown y limpiar categoría
    if (value.trim() && selectedCategory) {
      onCategoryChange(null);
    }
    
    // Mantener dropdown cerrado mientras escribe
    if (value.trim()) {
      setIsOpen(false);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    onCategoryChange(category);
    onSearchChange(''); // Limpiar búsqueda al seleccionar categoría
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onSearchChange('');
    onCategoryChange(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getPlaceholder = () => {
    if (selectedCategory) {
      return translateCategory(selectedCategory);
    }
    return t('catalog.searchAndFilter');
  };

  const hasActiveFilter = searchTerm.trim() || selectedCategory;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={getPlaceholder()}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          className={cn(
            "pl-10 pr-20 py-2 w-full border-none text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200",
            "bg-gray-100 dark:bg-gray-700",
            selectedCategory && "border-l-4 border-l-primary bg-blue-50 dark:bg-gray-600",
            isOpen && "ring-2 ring-primary/20"
          )}
          aria-label={t('catalog.searchAndFilter')}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label={t('form.clearFilters')}
            >
              <X className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-label={t('form.showCategories')}
          >
            <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Dropdown de categorías */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-1">
            {categoryOptions.map((option, index) => (
              <button
                key={option.value || 'all'}
                onClick={() => handleCategorySelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-sm text-sm transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none",
                  "text-gray-900 dark:text-gray-100",
                  hoveredIndex === index && "bg-gray-100 dark:bg-gray-700",
                  selectedCategory === option.value && "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary font-medium",
                  !option.value && "font-medium border-b border-gray-100 dark:border-gray-700"
                )}
              >
                {option.label}
                {selectedCategory === option.value && (
                  <span className="ml-2 text-xs text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;
