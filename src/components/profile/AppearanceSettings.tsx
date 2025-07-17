
import React from 'react';
import { Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeSelector from '@/components/ThemeSelector';
import BackgroundSelector from '@/components/BackgroundSelector';

const AppearanceSettings = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} className="text-primary" />
        <h2 className="text-base font-semibold gradient-text">{t('profile.chooseStyle')}</h2>
      </div>
      
      <div className="space-y-4">
        <ThemeSelector />
        <BackgroundSelector />
      </div>
    </div>
  );
};

export default AppearanceSettings;
