
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarMenu from './SidebarMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, color } = useTheme();
  const { t } = useLanguage();

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
          <h1 className="text-2xl font-bold gradient-text">{title}</h1>
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
          <Link to="/manage">
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800">
              <Trash2 className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      </div>
    </header>
  );
};

export default Header;
