
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { mode, setMode } = useTheme();
  const { t } = useLanguage();

  // Handle theme toggle (light/dark only, not system)
  const handleThemeToggle = (checked: boolean) => {
    const newMode = checked ? 'dark' : 'light';
    console.log("Theme toggled to:", newMode);
    setMode(newMode);
    if (onThemeChange) onThemeChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t('profile.theme.selector')}
        </span>
        
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Switch 
            checked={mode === 'dark'}
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
