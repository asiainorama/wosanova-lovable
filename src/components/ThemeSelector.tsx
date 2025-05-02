
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { mode, color, setColor, setMode } = useTheme();
  const { t } = useLanguage();
  const isDarkMode = mode === 'dark';

  const colorOptions = [
    { color: 'blue', icon: CircleDot, label: t('profile.color.blue') },
    { color: 'gray', icon: SquareDot, label: t('profile.color.gray') },
    { color: 'green', icon: Flower2, label: t('profile.color.green') },
    { color: 'red', icon: FlameKindling, label: t('profile.color.red') },
    { color: 'pink', icon: Heart, label: t('profile.color.pink') },
    { color: 'orange', icon: Palette, label: t('profile.color.orange') }
  ];

  const handleColorChange = (newColor: string) => {
    console.log("Changing theme color to:", newColor);
    setColor(newColor as any);
    if (onThemeChange) onThemeChange();
  };

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
      
      {/* Color Selection - Simplified grid */}
      <div className="space-y-1">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('profile.theme.accent')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.color}
              type="button"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                color === option.color ? "border-primary" : "border-muted bg-popover",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
              onClick={() => handleColorChange(option.color)}
            >
              <option.icon className="h-3 w-3" />
              <span className="text-[9px] dark:text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
