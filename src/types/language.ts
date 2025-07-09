
export interface LanguageContextType {
  language: 'es' | 'en';
  setLanguage: (language: 'es' | 'en') => void;
  t: (key: string) => string;
}

export interface LanguageProviderProps {
  children: React.ReactNode;
}
