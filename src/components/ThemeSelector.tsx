
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { color, setColor } = useTheme();
  const { t } = useLanguage();

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

  return (
    <div className="space-y-4">      
      {/* Color Selection - Grid with improved color visibility */}
      <div className="space-y-1">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('profile.theme.accent')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((option) => {
            const isSelected = color === option.color;
            const colorVar = `var(--${option.color}-500)`;
            const borderColorVar = `var(--${option.color}-700)`;
            
            return (
              <button
                key={option.color}
                type="button"
                className={cn(
                  "flex flex-col items-center justify-between rounded-md p-1 hover:opacity-90 cursor-pointer transition-all",
                  "border-2",
                  isSelected 
                    ? "border-primary dark:border-white" 
                    : "border-muted",
                  isSelected
                    ? "bg-primary dark:!bg-opacity-80 text-white"
                    : "bg-popover dark:bg-gray-800"
                )}
                onClick={() => handleColorChange(option.color)}
                style={{
                  backgroundColor: isSelected ? colorVar : '',
                  borderColor: isSelected ? borderColorVar : ''
                }}
              >
                <option.icon className={cn(
                  "h-3 w-3 mb-1",
                  isSelected ? "text-white" : ""
                )} 
                style={!isSelected ? { color: colorVar } : {}} />
                
                <span className={cn(
                  "text-[9px]",
                  isSelected ? "text-white" : "dark:text-gray-200"
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
