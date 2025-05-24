
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

// Helper function to get icon by name
const getIconByName = (name: string) => {
  switch (name.toLowerCase()) {
    case 'home':
      return <Home className="h-5 w-5" />;
    case 'catalog':
    case 'search':
      return <Search className="h-5 w-5" />;
    case 'manage':
    case 'trash':
      return <Trash2 className="h-5 w-5" />;
    case 'admin':
    case 'settings':
      return <Settings className="h-5 w-5" />;
    default:
      return <Home className="h-5 w-5" />;
  }
};

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

  const activePage = determineActivePage();
  const navigationLinks = getNavigationLinks();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* We keep the title hidden but in the DOM for functionality */}
      <span className="sr-only">{title}</span>
      
      <div className="bg-white w-full border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="w-full px-4 py-2">
          <div className="flex items-center">
            {/* Left side - hamburger menu */}
            <div className="mr-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="dark:text-white dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Center navigation icons */}
            <div className="flex justify-center items-center gap-2 mx-auto">
              {navigationLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant={activePage === link.text.toLowerCase() ? "default" : "ghost"}
                    size="icon"
                    className={`rounded-full ${
                      activePage === link.text.toLowerCase()
                        ? "bg-primary text-white"
                        : "text-gray-500 dark:text-gray-300"
                    }`}
                    aria-label={link.text}
                  >
                    {link.icon || getIconByName(link.text)}
                  </Button>
                </Link>
              ))}
            </div>
            
            {/* Right side - empty space for balance */}
            <div className="ml-4 w-10"></div>
          </div>
        </div>
      </div>

      <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
    </header>
  );
};

export default Header;
