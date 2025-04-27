
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { mode, color, toggleMode, setColor } = useTheme();

  const colorOptions = [
    { color: 'blue', icon: CircleDot, label: 'Azul' },
    { color: 'gray', icon: SquareDot, label: 'Gris' },
    { color: 'green', icon: Flower2, label: 'Verde' },
    { color: 'red', icon: FlameKindling, label: 'Rojo' },
    { color: 'pink', icon: Heart, label: 'Rosa' },
    { color: 'orange', icon: Palette, label: 'Naranja' }
  ];

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-between"
        onClick={toggleMode}
      >
        <span>Modo {mode === 'light' ? 'Claro' : 'Oscuro'}</span>
        {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      
      <div className="grid grid-cols-3 gap-2">
        {colorOptions.map((option) => (
          <Button 
            key={option.color}
            variant="outline"
            className={`p-2 flex flex-col items-center hover:bg-accent ${
              color === option.color ? 'bg-accent' : ''
            }`}
            onClick={() => setColor(option.color as any)}
          >
            <option.icon className="h-4 w-4" />
            <span className="text-xs mt-1">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
