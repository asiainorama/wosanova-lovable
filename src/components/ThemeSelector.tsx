
import React from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { mode, setMode } = useTheme();
  const { t } = useLanguage();

  // Handle theme toggle between system (default) and user preference
  const handleThemeToggle = (checked: boolean) => {
    // Si está activado, usar modo oscuro, si no, usar modo claro
    // Si está en 'system', cambiar a un modo explícito
    let newMode: ThemeMode = checked ? 'dark' : 'light';
    
    console.log("Theme toggled to:", newMode);
    setMode(newMode);
    if (onThemeChange) onThemeChange();
  };

  // Determinar si el interruptor debe estar activado
  const isChecked = mode === 'dark';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Elige tu estilo
        </span>
        
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Switch 
            checked={isChecked}
            onCheckedChange={handleThemeToggle}
            aria-label={t('profile.theme.toggle')}
          />
          <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
