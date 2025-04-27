
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Grid3X3, 
  Settings, 
  Sun, 
  Moon,
  Blue,
  Gray,
  Green,
  Red,
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
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid3X3, label: 'Catálogo', path: '/catalog' },
    { icon: Settings, label: 'Gestionar Mis Apps', path: '/manage' }
  ];

  const colorOptions = [
    { color: 'blue', icon: Blue, label: 'Azul' },
    { color: 'gray', icon: Gray, label: 'Gris' },
    { color: 'green', icon: Green, label: 'Verde' },
    { color: 'red', icon: Red, label: 'Rojo' },
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

          {/* Theme Settings */}
          <div className="p-4 mt-auto border-t border-white/20">
            <h3 className="mb-3 text-sm font-medium uppercase opacity-70">Ajustes de tema</h3>
            
            {/* Light/Dark Toggle */}
            <Button 
              variant="ghost" 
              className="w-full justify-between mb-4 text-white hover:bg-white/10"
              onClick={toggleMode}
            >
              <span>Modo {mode === 'light' ? 'Claro' : 'Oscuro'}</span>
              {mode === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            
            {/* Color Selector */}
            <h4 className="mb-2 text-sm font-medium">Color del tema</h4>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((option) => (
                <Button 
                  key={option.color}
                  variant="ghost" 
                  className={`p-2 flex flex-col items-center hover:bg-white/10 ${
                    color === option.color ? 'bg-white/20' : ''
                  }`}
                  onClick={() => setColor(option.color as any)}
                >
                  <option.icon size={16} />
                  <span className="text-xs mt-1">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
