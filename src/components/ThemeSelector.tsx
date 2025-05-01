
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { mode, color, toggleMode, setColor, setMode } = useTheme();
  const { t } = useLanguage();

  const colorOptions = [
    { color: 'blue', icon: CircleDot, label: t('profile.color.blue') },
    { color: 'gray', icon: SquareDot, label: t('profile.color.gray') },
    { color: 'green', icon: Flower2, label: t('profile.color.green') },
    { color: 'red', icon: FlameKindling, label: t('profile.color.red') },
    { color: 'pink', icon: Heart, label: t('profile.color.pink') },
    { color: 'orange', icon: Palette, label: t('profile.color.orange') }
  ];

  const handleModeChange = (value: string) => {
    console.log("Changing theme mode to:", value);
    setMode(value as 'light' | 'dark' | 'system');
    if (onThemeChange) onThemeChange();
  };

  const handleColorChange = (newColor: string) => {
    console.log("Changing theme color to:", newColor);
    setColor(newColor as any);
    if (onThemeChange) onThemeChange();
  };

  return (
    <div className="space-y-2">
      {/* Mode Selection - More compact */}
      <div className="space-y-1">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('profile.theme.mode')}</h3>
        <RadioGroup 
          value={mode}
          onValueChange={handleModeChange}
          className="grid grid-cols-2 gap-2"
        >
          <div>
            <RadioGroupItem 
              value="light" 
              id="light-mode" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="light-mode"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                mode === "light" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Sun className="mb-1 h-3 w-3" />
              <span className="text-[9px] dark:text-white">{t('profile.theme.light')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem 
              value="dark" 
              id="dark-mode" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="dark-mode"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                mode === "dark" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Moon className="mb-1 h-3 w-3" />
              <span className="text-[9px] dark:text-white">{t('profile.theme.dark')}</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Color Selection - More compact grid */}
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
