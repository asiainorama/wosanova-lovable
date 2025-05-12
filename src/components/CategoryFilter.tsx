
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const { t, language } = useLanguage();
  const [allApps, setAllApps] = useState<AppData[]>([]);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para traducir categorías
  const translateCategory = (category: string) => {
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category;
  };
  
  // Obtener todas las apps y extraer categorías únicas
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
          category: app.subcategory || app.category, // Usar subcategoría como categoría principal
          subcategory: "",
          isAI: app.is_ai,
          created_at: app.created_at,
          updated_at: app.updated_at
        }));
        
        setAllApps(fetchedApps);
        
        // Extraer categorías únicas, priorizando subcategorías
        const uniqueCategories = Array.from(
          new Set(fetchedApps.map(app => app.category))
        ).filter(Boolean).sort();
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching apps for category filter:', error);
      }
    };

    fetchApps();
    
    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('category-filter-changes')
      .on('postgres_changes', 
        {
          event: '*',
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
  
  // Responder a los cambios de idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log("CategoryFilter detected language change:", language);
    };
    
    document.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      document.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [language]);

  // Filtrar categorías por término de búsqueda
  const filteredCategories = searchTerm 
    ? categories.filter(cat => 
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        translateCategory(cat).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-100 border-none"
        >
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-gray-400" />
            {selectedCategory === "all" 
              ? t('catalog.allCategories') 
              : translateCategory(selectedCategory)}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={t('catalog.searchCategories')} 
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>{t('catalog.noCategoriesFound')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="all"
                value="all"
                onSelect={() => {
                  onCategoryChange("all");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCategory === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                {t('catalog.allCategories')}
              </CommandItem>
              
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category}
                  value={category}
                  onSelect={() => {
                    onCategoryChange(category);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategory === category ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {translateCategory(category)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryFilter;
