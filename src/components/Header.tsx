
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Search, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SidebarMenu from './SidebarMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, color } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // Mantener estado del componente sincronizado con el contexto
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  // Función mejorada para cambiar el idioma
  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    console.log("Header language change:", newLanguage);
    
    // No actualizar si ya es el mismo idioma
    if (newLanguage === currentLanguage) return;
    
    // Actualizar primero el estado local para evitar parpadeos en la UI
    setCurrentLanguage(newLanguage);
    
    // Actualizar el contexto
    setLanguage(newLanguage);
    
    // Guardar en localStorage directamente
    localStorage.setItem('language', newLanguage);
    
    // Disparar un evento para notificar el cambio de idioma
    setTimeout(() => {
      const event = new CustomEvent('languagechange', { 
        detail: { language: newLanguage }
      });
      document.dispatchEvent(event);
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:flex dark:text-white dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className={`text-2xl font-bold text-primary dark:text-white theme-text`}>{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/catalog">
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuItem 
                onClick={() => handleLanguageChange('es')}
                className={`${currentLanguage === 'es' ? 'bg-primary/10 dark:bg-primary/20' : ''} cursor-pointer`}
              >
                🇪🇸 {t('profile.spanish')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleLanguageChange('en')}
                className={`${currentLanguage === 'en' ? 'bg-primary/10 dark:bg-primary/20' : ''} cursor-pointer`}
              >
                🇬🇧 {t('profile.english')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      </div>
    </header>
  );
};

export default Header;
