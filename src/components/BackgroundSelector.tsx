
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BackgroundSelectorProps {
  selectedBackground: string;
  onBackgroundChange: (background: string) => void;
}

const BACKGROUND_OPTIONS = [
  {
    id: 'default',
    name: 'Espacio (Por defecto)',
    preview: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    value: '/lovable-uploads/6a5b9b5f-b488-4e38-9dc2-fc56fc85bfd9.png'
  },
  {
    id: 'pastel',
    name: 'Tonos Pastel',
    preview: 'bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300',
    value: 'linear-gradient(135deg, #fef7cd 0%, #f9a8d4 50%, #d8b4fe 100%)'
  },
  {
    id: 'gray',
    name: 'Tonos Grisáceos',
    preview: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600',
    value: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #4b5563 100%)'
  },
  {
    id: 'mango',
    name: 'Colores Vivos Mango',
    preview: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    value: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)'
  },
  {
    id: 'pink-orange',
    name: 'Rosa Chillón y Naranja',
    preview: 'bg-gradient-to-br from-pink-400 via-pink-500 to-orange-400',
    value: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #fb923c 100%)'
  },
  {
    id: 'green-blue',
    name: 'Verdosos y Azulados',
    preview: 'bg-gradient-to-br from-green-300 via-teal-400 to-blue-500',
    value: 'linear-gradient(135deg, #86efac 0%, #2dd4bf 50%, #3b82f6 100%)'
  }
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  selectedBackground,
  onBackgroundChange
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium dark:text-white">
          Fondo de pantalla de inicio
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Elige el fondo que más te guste para tu pantalla principal
        </p>
      </div>

      <RadioGroup 
        value={selectedBackground} 
        onValueChange={onBackgroundChange}
        className="grid grid-cols-2 gap-3"
      >
        {BACKGROUND_OPTIONS.map((option) => (
          <div key={option.id} className="relative">
            <RadioGroupItem
              value={option.id}
              id={option.id}
              className="sr-only"
            />
            <label
              htmlFor={option.id}
              className={`
                relative block cursor-pointer rounded-lg border-2 p-3 transition-all
                ${selectedBackground === option.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div 
                className={`h-16 w-full rounded-md ${option.preview} mb-2`}
                style={option.id !== 'default' ? { 
                  background: option.value 
                } : {
                  backgroundImage: `url(${option.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <span className="text-xs font-medium dark:text-white">
                {option.name}
              </span>
              {selectedBackground === option.id && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default BackgroundSelector;
