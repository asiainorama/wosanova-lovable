import React from 'react';
import { useBackground, BackgroundType } from '@/contexts/BackgroundContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BackgroundSelectorProps {
  onBackgroundChange?: () => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onBackgroundChange }) => {
  const { background, setBackground } = useBackground();
  const { t } = useLanguage();

  const backgroundOptions: { value: BackgroundType; label: string; preview: React.CSSProperties }[] = [
    {
      value: 'default',
      label: t('profile.wallpaper.aurora'),
      preview: {
        backgroundImage: 'url(/lovable-uploads/6a5b9b5f-b488-4e38-9dc2-fc56fc85bfd9.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    {
      value: 'gradient-blue',
      label: t('profile.wallpaper.ocean'),
      preview: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    },
    {
      value: 'gradient-purple',
      label: t('profile.wallpaper.pinkBubble'),
      preview: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    },
    {
      value: 'gradient-green',
      label: t('profile.wallpaper.sky'),
      preview: { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
    },
    {
      value: 'gradient-orange',
      label: t('profile.wallpaper.mango'),
      preview: { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    },
    {
      value: 'gradient-pink',
      label: t('profile.wallpaper.cotton'),
      preview: { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
    }
  ];

  const handleBackgroundChange = (value: string) => {
    setBackground(value as BackgroundType);
    if (onBackgroundChange) onBackgroundChange();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium dark:text-white">
        {t('profile.wallpaper')}
      </Label>
      
      <RadioGroup value={background} onValueChange={handleBackgroundChange} className="grid grid-cols-2 gap-3">
        {backgroundOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label 
              htmlFor={option.value} 
              className="flex items-center gap-2 cursor-pointer text-xs dark:text-white"
            >
              <div 
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600" 
                style={option.preview}
              />
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default BackgroundSelector;