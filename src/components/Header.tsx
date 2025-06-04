import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Search, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  title: string;
  onSidebarOpen?: () => void;
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

const Header: React.FC<HeaderProps> = ({ title, onSidebarOpen }) => {
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

  // Create links array without admin link (moved to sidebar)
  const getNavigationLinks = () => {
    const links = [
      { text: 'Home', href: '/', icon: null },
      { text: 'Catalog', href: '/catalog', icon: null },
      { text: 'Manage', href: '/manage', icon: null },
    ];
    
    return links;
  };

  const activePage = determineActivePage();
  const navigationLinks = getNavigationLinks();

  // Get sidebar open function from parent or create a default one
  const handleSidebarOpen = () => {
    if (onSidebarOpen) {
      onSidebarOpen();
    } else {
      // Dispatch a custom event that the App component can listen to
      window.dispatchEvent(new CustomEvent('openSidebar'));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* We keep the title hidden but in the DOM for functionality */}
      <span className="sr-only">{title}</span>
      
      {/* Glassmorphism effect with backdrop blur and translucent background */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 w-full border-b border-white/20 dark:border-gray-800/30 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - app logo and hamburger menu */}
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
                alt="WosaNova Logo" 
                className="w-8 h-8"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="dark:text-white dark:hover:bg-white/10 hover:bg-black/5 transition-colors"
                onClick={handleSidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Right side - navigation icons */}
            <div className="flex items-center gap-2">
              {navigationLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant={activePage === link.text.toLowerCase() ? "default" : "ghost"}
                    size="icon"
                    className={`rounded-full transition-all ${
                      activePage === link.text.toLowerCase()
                        ? "bg-primary/90 text-white shadow-lg backdrop-blur-sm"
                        : "text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    aria-label={link.text}
                  >
                    {link.icon || getIconByName(link.text)}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
