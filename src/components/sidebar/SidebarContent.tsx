
import React from 'react';
import TimeWidget from './TimeWidget';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import WidgetIconsRow from './WidgetIconsRow';
import { useLanguage } from '@/contexts/LanguageContext';

const SidebarContent: React.FC = () => {
  let t: (key: string) => string;
  
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    // Fallback if LanguageProvider is not available
    console.warn('LanguageProvider not available, using fallback translations');
    t = (key: string) => {
      const fallbackTranslations: Record<string, string> = {
        'sidebar.calendar': 'Calendar',
        // Add other fallback translations as needed
      };
      return fallbackTranslations[key] || key;
    };
  }

  return (
    <div className="flex flex-col justify-between flex-1 overflow-y-auto overflow-x-hidden">
      {/* Top section with Time and Weather - takes natural space */}
      <div className="flex-shrink-0 space-y-2 px-3 py-2">
        <TimeWidget />
        <WeatherWidget />
      </div>

      {/* Center section with Widget Icons - centered in available space */}
      <div className="flex-1 flex items-center justify-center px-2">
        <WidgetIconsRow />
      </div>
      
      {/* Bottom section with Calendar - takes natural space at bottom */}
      <div className="flex-shrink-0 px-3 pb-2">
        <h3 className="text-xs font-medium mb-2 dark:text-gray-300">{t('sidebar.calendar')}</h3>
        <div className="w-full">
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
