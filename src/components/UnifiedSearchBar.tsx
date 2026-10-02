
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
  const searchRef = useRef<HTMLDivElement>(null);

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
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
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
    setIsOpen(open => !open);
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
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={getPlaceholder()}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          className={cn(
            "rounded-full border-none bg-foreground text-background placeholder:text-background/60 shadow-md transition-all duration-200",
            "pr-24 py-2.5 w-full",
            selectedCategory && "pl-8 font-medium",
            isOpen && "ring-2 ring-primary/40"
          )}
          aria-label={t('catalog.searchAndFilter')}
        />

        {selectedCategory && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary z-10"
            aria-hidden="true"
          />
        )}

        <div className="absolute right-9 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 rounded-full hover:bg-background/10"
              aria-label={t('form.clearFilters')}
            >
              <X className="h-3 w-3 text-background" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-6 w-6 p-0 rounded-full hover:bg-background/10 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-label={t('form.showCategories')}
            aria-expanded={isOpen}
          >
            <ChevronDown className="h-3 w-3 text-background" />
          </Button>
        </div>
      </div>

      {/* Dropdown de categorías */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-foreground text-background shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-1.5">
            {categoryOptions.map((option, index) => (
              <button
                key={option.value || 'all'}
                onClick={() => handleCategorySelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors",
                  "hover:bg-background/10 focus:bg-background/10 focus:outline-none",
                  "text-background",
                  selectedCategory === option.value && "font-semibold",
                  !option.value && "font-medium border-b border-background/10 rounded-b-none"
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
