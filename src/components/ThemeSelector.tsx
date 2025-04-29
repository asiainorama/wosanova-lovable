
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Sun, Moon, CircleDot, SquareDot, Flower2, FlameKindling, Heart, Palette } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Modo de apariencia</h3>
            <RadioGroup 
              defaultValue={mode} 
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  <span>Claro</span>
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  <span>Oscuro</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Color de acento</h3>
            <RadioGroup 
              defaultValue={color}
              onValueChange={(value) => setColor(value as any)}
              className="grid grid-cols-3 gap-2"
            >
              {colorOptions.map((option) => (
                <div key={option.color}>
                  <RadioGroupItem
                    value={option.color}
                    id={`color-${option.color}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`color-${option.color}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <option.icon className="mb-2 h-6 w-6" />
                    <span className="text-xs">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
