
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const ThemeSelector = () => {
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

  return (
    <div className="space-y-3">
      {/* Mode Selection - More compact */}
      <div className="space-y-1">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('profile.theme.mode')}</h3>
        <RadioGroup 
          value={mode}
          onValueChange={(value: string) => {
            console.log("Changing theme mode to:", value);
            setMode(value as 'light' | 'dark');
          }}
          className="grid grid-cols-2 gap-2"
        >
          <div>
            <RadioGroupItem 
              value="light" 
              id="light" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="light"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                mode === "light" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Sun className="mb-1 h-4 w-4" />
              <span className="text-xs dark:text-white">{t('profile.theme.light')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem 
              value="dark" 
              id="dark" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="dark"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                mode === "dark" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Moon className="mb-1 h-4 w-4" />
              <span className="text-xs dark:text-white">{t('profile.theme.dark')}</span>
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
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 p-1.5 hover:bg-accent hover:text-accent-foreground",
                color === option.color ? "border-primary" : "border-muted bg-popover",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
              onClick={() => setColor(option.color as any)}
            >
              <option.icon className="h-4 w-4" />
              <span className="text-[10px] dark:text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
