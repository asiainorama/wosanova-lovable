
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Global
    'app.name': 'WosaNova',
    'app.description': 'La mayor colección de WebApps del mundo',
    'app.preview': 'Previsualizar',
    
    // Header
    'header.home': 'Inicio',
    'header.catalog': 'Catálogo',
    'header.manage': 'Gestionar',
    'header.profile': 'Perfil',
    'header.language': 'Idioma',
    'header.spanish': 'Español',
    'header.english': 'Inglés',
    
    // Home Page
    'home.title': 'Inicio',
    'home.myApps': 'Mis Aplicaciones',
    'home.noApps': 'No tienes aplicaciones añadidas',
    'home.addFromCatalog': 'Agrega aplicaciones desde el catálogo para verlas aquí',
    'home.exploreCatalog': 'Explorar Catálogo',
    
    // Catalog Page
    'catalog.title': 'Catálogo',
    'catalog.applications': 'Aplicaciones',
    'catalog.search': 'Buscar aplicaciones...',
    'catalog.allCategories': 'Todas las categorías',
    'catalog.featured': 'Destacadas',
    'catalog.allApps': 'Todas las aplicaciones',
    'catalog.results': 'Resultados',
    'catalog.gridView': 'Vista de cuadrícula',
    'catalog.listView': 'Vista de lista',
    'catalog.category': 'Categoría',
    'catalog.categoryGroup': 'Grupo de categoría',
    
    // Profile Page
    'profile.title': 'Área Personal',
    'profile.description': 'Gestiona tu perfil y preferencias de la aplicación',
    'profile.username': 'Nombre de usuario',
    'profile.avatar': 'Imagen de perfil',
    'profile.save': 'Guardar cambios',
    'profile.appearance': 'Preferencias de apariencia',
    'profile.language': 'Idioma',
    'profile.spanish': 'Español',
    'profile.english': 'Inglés',
    'profile.logout': 'Cerrar sesión',
    'profile.delete': 'Eliminar mi cuenta',
    'profile.delete.confirm': '¿Estás seguro?',
    'profile.delete.description': 'Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos asociados.',
    'profile.cancel': 'Cancelar',
    'profile.theme.light': 'Claro',
    'profile.theme.dark': 'Oscuro',
    'profile.theme.mode': 'Modo de apariencia',
    'profile.theme.accent': 'Color de acento',
    'profile.color.blue': 'Azul',
    'profile.color.gray': 'Gris',
    'profile.color.green': 'Verde',
    'profile.color.red': 'Rojo',
    'profile.color.pink': 'Rosa',
    'profile.color.orange': 'Naranja',

    // Category Groups
    'category.productivity': 'Productividad',
    'category.entertainment': 'Entretenimiento',
    'category.utilities': 'Utilidades',
    'category.lifestyle': 'Estilo de Vida',
    'category.finance': 'Finanzas',
    'category.other': 'Otros',
    
    // Auth page
    'auth.welcome': 'Bienvenido a WosaNova',
    'auth.description': 'Inicia sesión o regístrate para continuar',
    'auth.login': 'Iniciar sesión',
    'auth.signup': 'Registrarse',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.remember': 'Recordarme',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
  },
  en: {
    // Global
    'app.name': 'WosaNova',
    'app.description': 'The largest collection of WebApps in the world',
    'app.preview': 'Preview',
    
    // Header
    'header.home': 'Home',
    'header.catalog': 'Catalog',
    'header.manage': 'Manage',
    'header.profile': 'Profile',
    'header.language': 'Language',
    'header.spanish': 'Spanish',
    'header.english': 'English',
    
    // Home Page
    'home.title': 'Home',
    'home.myApps': 'My Applications',
    'home.noApps': 'You have no added applications',
    'home.addFromCatalog': 'Add applications from the catalog to see them here',
    'home.exploreCatalog': 'Explore Catalog',
    
    // Catalog Page
    'catalog.title': 'Catalog',
    'catalog.applications': 'Applications',
    'catalog.search': 'Search applications...',
    'catalog.allCategories': 'All categories',
    'catalog.featured': 'Featured',
    'catalog.allApps': 'All applications',
    'catalog.results': 'Results',
    'catalog.gridView': 'Grid view',
    'catalog.listView': 'List view',
    'catalog.category': 'Category',
    'catalog.categoryGroup': 'Category Group',
    
    // Profile Page
    'profile.title': 'Personal Area',
    'profile.description': 'Manage your profile and application preferences',
    'profile.username': 'Username',
    'profile.avatar': 'Profile picture',
    'profile.save': 'Save changes',
    'profile.appearance': 'Appearance preferences',
    'profile.language': 'Language',
    'profile.spanish': 'Spanish',
    'profile.english': 'English',
    'profile.logout': 'Log out',
    'profile.delete': 'Delete my account',
    'profile.delete.confirm': 'Are you sure?',
    'profile.delete.description': 'This action cannot be undone. It will permanently delete your account and all your associated data.',
    'profile.cancel': 'Cancel',
    'profile.theme.light': 'Light',
    'profile.theme.dark': 'Dark',
    'profile.theme.mode': 'Appearance mode',
    'profile.theme.accent': 'Accent color',
    'profile.color.blue': 'Blue',
    'profile.color.gray': 'Gray',
    'profile.color.green': 'Green',
    'profile.color.red': 'Red',
    'profile.color.pink': 'Pink',
    'profile.color.orange': 'Orange',

    // Category Groups
    'category.productivity': 'Productivity',
    'category.entertainment': 'Entertainment',
    'category.utilities': 'Utilities',
    'category.lifestyle': 'Lifestyle',
    'category.finance': 'Finance',
    'category.other': 'Other',
    
    // Auth page
    'auth.welcome': 'Welcome to WosaNova',
    'auth.description': 'Log in or sign up to continue',
    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.remember': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Use state initialization with a callback to ensure we only read from localStorage once
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'es';
  });

  const setLanguage = (newLanguage: Language) => {
    console.log("Setting language to:", newLanguage);
    if (newLanguage === 'en' || newLanguage === 'es') {
      localStorage.setItem('language', newLanguage);
      setLanguageState(newLanguage);
      
      // Force event to notify about language change
      const event = new Event('languagechange');
      document.dispatchEvent(event);
    } else {
      console.error("Invalid language:", newLanguage);
    }
  };

  const t = (key: string): string => {
    const currentTranslations = translations[language] || translations.es;
    return currentTranslations[key as keyof typeof translations.es] || key;
  };

  useEffect(() => {
    console.log("Language set in localStorage:", language);
    
    // Update document language
    document.documentElement.lang = language;
    
    // Add debugging info for language changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        console.log("Language changed in storage:", e.newValue);
        if (e.newValue === 'en' || e.newValue === 'es') {
          setLanguageState(e.newValue as Language);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
