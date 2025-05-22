
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, Trash2, Settings } from 'lucide-react';

interface TopBarLink {
  text: string;
  href: string;
  icon: React.ReactNode;
}

interface TopBarProps {
  activePage: string;
  links?: TopBarLink[];
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

const TopBar: React.FC<TopBarProps> = ({ activePage, links = [] }) => {
  // Default links if none provided
  const navigationLinks = links.length > 0 ? links : [
    { text: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
    { text: 'Catalog', href: '/catalog', icon: <Search className="h-5 w-5" /> },
    { text: 'Manage', href: '/manage', icon: <Trash2 className="h-5 w-5" /> }
  ];

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm w-full">
      <div className="w-full px-4 py-2">
        <div className="flex justify-center items-center gap-2">
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
                title={link.text}
              >
                {link.icon || getIconByName(link.text)}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
