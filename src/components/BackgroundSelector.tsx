import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  wallpaperImages,
  wallpaperLabelKeys,
  type BackgroundType,
} from '@/constants/wallpapers';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BackgroundSelectorProps {
  onBackgroundChange?: () => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onBackgroundChange }) => {
  const { background, setBackground } = useBackground();
  const { t } = useLanguage();

  const backgroundOptions = (Object.keys(wallpaperImages) as BackgroundType[]).map((value) => ({
    value,
    label: t(wallpaperLabelKeys[value]),
    image: wallpaperImages[value],
  }));

  const handleBackgroundChange = (value: string) => {
    setBackground(value as BackgroundType);
    if (onBackgroundChange) onBackgroundChange();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{t('profile.wallpaper')}</Label>

      <RadioGroup value={background} onValueChange={handleBackgroundChange} className="grid grid-cols-2 gap-3">
        {backgroundOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label
              htmlFor={option.value}
              className="flex items-center gap-2 cursor-pointer text-xs"
            >
              <span
                className="w-8 h-8 rounded-lg border border-border shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url(${option.image})` }}
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
