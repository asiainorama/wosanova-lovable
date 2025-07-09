
import * as React from 'react';
import { translations } from '@/constants/translations';
import { LanguageContextType, LanguageProviderProps } from '@/types/language';

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = React.useState<'es' | 'en'>(() => {
    // Default to English for non-registered users
    const savedLanguage = localStorage.getItem('language') as 'es' | 'en';
    return savedLanguage || 'en';
  });

  const setLanguage = (newLanguage: 'es' | 'en') => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    if (!key) return '';
    
    try {
      const currentTranslations = translations[language];
      const result = currentTranslations[key as keyof typeof currentTranslations];
      
      if (result === undefined) {
        console.debug(`Missing translation for key: ${key} in language: ${language}`);
        return key;
      }
      
      return result;
    } catch (e) {
      console.error("Error in translation function:", e);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
