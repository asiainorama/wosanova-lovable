
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
  const isDarkMode = mode === 'dark';

  // Dark mode toggle handler
  const handleDarkModeToggle = (checked: boolean) => {
    console.log("Dark mode toggle switch changed to:", checked ? "dark" : "light");
    const newMode = checked ? 'dark' : 'light';
    setMode(newMode);
    if (onThemeChange) onThemeChange();
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection - Fixed toggle implementation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <span className="text-sm font-medium">{t('profile.theme.light')}</span>
        </div>
        
        <Switch
          checked={isDarkMode}
          onCheckedChange={handleDarkModeToggle}
          aria-label="Toggle dark mode"
        />
        
        <div className="flex items-center space-x-2">
          <Moon className="h-4 w-4" />
          <span className="text-sm font-medium">{t('profile.theme.dark')}</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
