
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Search, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarMenu from './SidebarMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkIfAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (session?.user?.email) {
        // Solo se considera administrador si el email es asiainorama@gmail.com o termina en @wosanova.com
        const isAdminUser = session.user.email.endsWith("@wosanova.com") || 
                          session.user.email === "asiainorama@gmail.com";
        setIsAdmin(isAdminUser);
      }
    };
    
    checkIfAdmin();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
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
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800" title={t('header.home') || "Inicio"}>
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/catalog">
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800" title={t('header.catalog') || "Catálogo"}>
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/manage">
            <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800" title={t('header.manage') || "Gestionar"}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-gray-800" title={t('header.admin') || "Administración"}>
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>

        <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      </div>
    </header>
  );
};

export default Header;
