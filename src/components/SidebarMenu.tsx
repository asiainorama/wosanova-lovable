
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Grid3X3, 
  Settings,
  User
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent
} from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { mode, color } = useTheme();
  const { t } = useLanguage();
  
  const menuItems = [
    { icon: User, label: t('sidebar.profile') || 'Área Personal', path: '/profile' },
    { icon: Home, label: t('sidebar.home') || 'Inicio', path: '/' },
    { icon: Grid3X3, label: t('sidebar.catalog') || 'Catálogo', path: '/catalog' },
    { icon: Settings, label: t('sidebar.manage') || 'Gestionar Mis Apps', path: '/manage' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-64 p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold dark:text-white">{t('sidebar.menu') || 'Menú'}</h2>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors dark:text-white dark:hover:bg-gray-800 ${
                      location.pathname === item.path 
                        ? 'bg-gray-100 font-medium dark:bg-gray-800 text-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onOpenChange(false)}
                  >
                    <item.icon size={18} className={location.pathname === item.path ? 'text-primary' : ''} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
