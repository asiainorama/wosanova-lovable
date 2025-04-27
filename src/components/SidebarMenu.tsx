import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Grid3X3, 
  Settings, 
  Sun, 
  Moon,
  CircleDot,
  SquareDot,
  Flower2,
  FlameKindling,
  Heart,
  Palette
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTheme, getThemeColorClass } from '@/contexts/ThemeContext';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { mode, color, toggleMode, setColor } = useTheme();
  const themeColor = getThemeColorClass(color);
  
  const menuItems = [
    { icon: Home, label: 'Área Personal', path: '/profile' },
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid3X3, label: 'Catálogo', path: '/catalog' },
    { icon: Settings, label: 'Gestionar Mis Apps', path: '/manage' }
  ];

  const colorOptions = [
    { color: 'blue', icon: CircleDot, label: 'Azul' },
    { color: 'gray', icon: SquareDot, label: 'Gris' },
    { color: 'green', icon: Flower2, label: 'Verde' },
    { color: 'red', icon: FlameKindling, label: 'Rojo' },
    { color: 'pink', icon: Heart, label: 'Rosa' },
    { color: 'orange', icon: Palette, label: 'Naranja' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={`w-64 p-0 ${themeColor.background} ${themeColor.text} border-r-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <h2 className="text-xl font-bold">Menú</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === item.path 
                        ? 'bg-white/20 font-medium' 
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => onOpenChange(false)}
                  >
                    <item.icon size={18} />
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
