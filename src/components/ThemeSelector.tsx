
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const ThemeSelector = () => {
  const { mode, color, toggleMode, setColor, setMode } = useTheme();

  const colorOptions = [
    { color: 'blue', icon: CircleDot, label: 'Azul' },
    { color: 'gray', icon: SquareDot, label: 'Gris' },
    { color: 'green', icon: Flower2, label: 'Verde' },
    { color: 'red', icon: FlameKindling, label: 'Rojo' },
    { color: 'pink', icon: Heart, label: 'Rosa' },
    { color: 'orange', icon: Palette, label: 'Naranja' }
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Modo de apariencia</h3>
        <RadioGroup 
          value={mode}
          onValueChange={(value) => setMode(value as 'light' | 'dark')}
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
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                mode === "light" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Sun className="mb-3 h-6 w-6" />
              <span className="dark:text-white">Claro</span>
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
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                mode === "dark" ? "border-primary" : "border-muted",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
            >
              <Moon className="mb-3 h-6 w-6" />
              <span className="dark:text-white">Oscuro</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Color Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color de acento</h3>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.color}
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground",
                color === option.color ? "border-primary" : "border-muted bg-popover",
                "dark:border-gray-700 dark:hover:bg-gray-700"
              )}
              onClick={() => setColor(option.color as any)}
            >
              <option.icon className="mb-2 h-6 w-6" />
              <span className="text-xs dark:text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
