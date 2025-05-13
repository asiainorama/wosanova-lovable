
import { useLanguage } from '@/contexts/LanguageContext';

export const useCategoryTranslator = () => {
  const { t } = useLanguage();
  
  // Function to translate categories
  const translateCategory = (category: string) => {
    // Convert to lowercase and normalize the identifier for the translation
    const key = `category.${category.toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : category; // If no translation, use the original
  };
  
  return { translateCategory };
};
