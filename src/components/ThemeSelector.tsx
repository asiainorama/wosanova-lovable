
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";

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
      <div className="bg-background border rounded-lg p-1 grid grid-cols-2 gap-1">
        <button
          onClick={() => setMode('light')}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            mode === 'light'
              ? "bg-primary text-white dark:bg-primary dark:text-primary-foreground"
              : "bg-transparent"
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Claro</span>
          {mode === 'light' && <Check className="h-4 w-4 ml-1" />}
        </button>
        <button
          onClick={() => setMode('dark')}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            mode === 'dark'
              ? "bg-primary text-white dark:bg-primary dark:text-primary-foreground"
              : "bg-transparent"
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Oscuro</span>
          {mode === 'dark' && <Check className="h-4 w-4 ml-1" />}
        </button>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Color de acento</h4>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.color}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-md transition-colors",
                "border hover:bg-accent hover:text-accent-foreground",
                color === option.color ? "border-primary bg-accent" : "border-input"
              )}
              onClick={() => setColor(option.color as any)}
            >
              <option.icon className={cn(
                "h-5 w-5",
                color === option.color ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="text-xs font-medium">{option.label}</span>
              {color === option.color && <Check className="h-3 w-3 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
