import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarMenu from './SidebarMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import TopBar from './TopBar';

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
        const isAdminUser = session.user.email.endsWith("@wosanova.com") || 
                          session.user.email === "asiainorama@gmail.com";
        setIsAdmin(isAdminUser);
      }
    };
    
    checkIfAdmin();
  }, []);

  // Determine active page from title
  const determineActivePage = () => {
    if (title.includes("Catálogo") || title.includes("Catalog")) return "catalog";
    if (title.includes("Gestionar") || title.includes("Manage")) return "manage";
    if (title.includes("Admin") || title.includes("Administración")) return "admin";
    return "home";
  };

  // Create links array with admin link if user is admin
  const getNavigationLinks = () => {
    const links = [
      { text: 'Home', href: '/', icon: null },
      { text: 'Catalog', href: '/catalog', icon: null },
      { text: 'Manage', href: '/manage', icon: null },
    ];
    
    if (isAdmin) {
      links.push({ text: 'Admin', href: '/admin', icon: null });
    }
    
    return links;
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
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
            {/* We keep the title hidden but in the DOM for functionality */}
            <span className="sr-only">{title}</span>
          </div>
        </div>
      </div>
      
      <TopBar 
        activePage={determineActivePage()} 
        links={getNavigationLinks()} 
      />

      <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
    </header>
  );
};

export default Header;
