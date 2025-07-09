
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  onLanguageChange?: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: 'es' | 'en') => {
    setLanguage(value);
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-primary" />
        <label className="text-sm font-medium dark:text-white">{t('profile.language')}</label>
      </div>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full h-9 text-sm dark:bg-gray-800/50 dark:text-white dark:border-gray-700 bg-white/50 backdrop-blur-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800/90 dark:text-white dark:border-gray-700 bg-white/90 backdrop-blur-sm">
          <SelectItem value="en" className="text-sm">
            🇺🇸 {t('profile.english')}
          </SelectItem>
          <SelectItem value="es" className="text-sm">
            🇪🇸 {t('profile.spanish')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
