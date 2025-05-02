
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
    'profile.deleted': 'Cuenta eliminada correctamente',

    // Category Groups
    'category.productivity': 'Productividad',
    'category.entertainment': 'Entretenimiento',
    'category.utilities': 'Utilidades',
    'category.lifestyle': 'Estilo de Vida',
    'category.finance': 'Finanzas',
    'category.other': 'Otros',
    'category.social': 'Social',
    'category.education': 'Educación',
    'category.shopping': 'Compras',
    'category.travel': 'Viajes',
    'category.health': 'Salud',
    'category.sports': 'Deportes',
    'category.news': 'Noticias',
    'category.business': 'Negocios',
    'category.food': 'Alimentación',
    'category.music': 'Música',
    'category.video': 'Vídeo',
    'category.photo': 'Fotografía',
    'category.games': 'Juegos',
    'category.weather': 'El Tiempo',
    'category.books': 'Libros',
    'category.art': 'Arte',
    'category.development': 'Desarrollo',
    'category.dating': 'Citas',
    
    // App Info
    'app.info.category': 'Categoría',
    'app.info.rating': 'Valoración',
    'app.info.author': 'Creador',
    'app.info.lastUpdate': 'Última actualización',
    'app.info.size': 'Tamaño',
    'app.info.languages': 'Idiomas',
    'app.info.platforms': 'Plataformas',
    'app.info.description': 'Descripción',
    'app.info.features': 'Características',
    'app.info.reviews': 'Reseñas',
    'app.info.screenshots': 'Capturas de pantalla',
    'app.info.relatedApps': 'Aplicaciones relacionadas',
    
    // Subcategories - Nuevas traducciones para subcategorías
    'subcategory.officeSuite': 'Suite de Oficina',
    'subcategory.documentEditing': 'Edición de Documentos',
    'subcategory.spreadsheets': 'Hojas de Cálculo',
    'subcategory.presentations': 'Presentaciones',
    'subcategory.notesTaking': 'Toma de Notas',
    'subcategory.taskManager': 'Gestor de Tareas',
    'subcategory.projectManager': 'Gestor de Proyectos',
    'subcategory.videoStreaming': 'Streaming de Vídeo',
    'subcategory.musicStreaming': 'Streaming de Música',
    'subcategory.podcasts': 'Podcasts',
    'subcategory.games': 'Juegos',
    'subcategory.movieDatabase': 'Base de Datos de Películas',
    'subcategory.fileManager': 'Gestor de Archivos',
    'subcategory.calculator': 'Calculadora',
    'subcategory.calendar': 'Calendario',
    'subcategory.translator': 'Traductor',
    'subcategory.converter': 'Conversor',
    'subcategory.scanner': 'Escáner',
    'subcategory.healthTracking': 'Seguimiento de Salud',
    'subcategory.fitnessTracker': 'Seguimiento de Ejercicio',
    'subcategory.meditation': 'Meditación',
    'subcategory.sleep': 'Sueño',
    'subcategory.cooking': 'Cocina',
    'subcategory.budgetingTools': 'Herramientas de Presupuesto',
    'subcategory.stockTrading': 'Comercio de Acciones',
    'subcategory.bankingApps': 'Aplicaciones Bancarias',
    'subcategory.cryptoTracker': 'Seguimiento de Criptomonedas',
    'subcategory.paymentApps': 'Aplicaciones de Pago',
    
    // App Descriptions
    'description.generalFeatured': 'Destacada por su facilidad de uso y funcionalidades',
    'description.productivityApp': 'Aumenta tu productividad con esta aplicación intuitiva',
    'description.entertainmentApp': 'Disfruta del mejor contenido de entretenimiento',
    'description.socialApp': 'Conecta con amigos y familiares',
    'description.educationApp': 'Aprende nuevas habilidades a tu ritmo',
    'description.utilityApp': 'Herramienta esencial para tu día a día',
    'description.financeApp': 'Gestiona tus finanzas de manera inteligente',
    'description.gameApp': 'Diviértete con este juego adictivo',
    'description.healthApp': 'Mejora tu bienestar con seguimiento personalizado',
    'description.newsApp': 'Mantente informado con noticias actualizadas',
    'description.photoApp': 'Edita y organiza tus fotos como un profesional',
    'description.videoApp': 'Visualiza y edita videos con facilidad',
    'description.musicApp': 'Disfruta de tu música favorita en cualquier momento',
    'description.travelApp': 'Planifica tus viajes de forma sencilla',
    'description.foodApp': 'Descubre recetas y consejos culinarios',
    'description.weatherApp': 'Pronóstico del tiempo preciso y actualizado',
    'description.shoppingApp': 'Compra online con ofertas exclusivas',
    
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

    // Error messages
    'error.signout': 'Error al cerrar sesión',
    'error.delete': 'Error al eliminar la cuenta',
    'error.profile': 'Error al actualizar el perfil',
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
    'profile.deleted': 'Account successfully deleted',

    // Category Groups
    'category.productivity': 'Productivity',
    'category.entertainment': 'Entertainment',
    'category.utilities': 'Utilities',
    'category.lifestyle': 'Lifestyle',
    'category.finance': 'Finance',
    'category.other': 'Other',
    'category.social': 'Social',
    'category.education': 'Education',
    'category.shopping': 'Shopping',
    'category.travel': 'Travel',
    'category.health': 'Health',
    'category.sports': 'Sports',
    'category.news': 'News',
    'category.business': 'Business',
    'category.food': 'Food',
    'category.music': 'Music',
    'category.video': 'Video',
    'category.photo': 'Photography',
    'category.games': 'Games',
    'category.weather': 'Weather',
    'category.books': 'Books',
    'category.art': 'Art',
    'category.development': 'Development',
    'category.dating': 'Dating',
    
    // App Info
    'app.info.category': 'Category',
    'app.info.rating': 'Rating',
    'app.info.author': 'Author',
    'app.info.lastUpdate': 'Last update',
    'app.info.size': 'Size',
    'app.info.languages': 'Languages',
    'app.info.platforms': 'Platforms',
    'app.info.description': 'Description',
    'app.info.features': 'Features',
    'app.info.reviews': 'Reviews',
    'app.info.screenshots': 'Screenshots',
    'app.info.relatedApps': 'Related Applications',
    
    // Subcategories - New translations for subcategories
    'subcategory.officeSuite': 'Office Suite',
    'subcategory.documentEditing': 'Document Editing',
    'subcategory.spreadsheets': 'Spreadsheets',
    'subcategory.presentations': 'Presentations',
    'subcategory.notesTaking': 'Notes Taking',
    'subcategory.taskManager': 'Task Manager',
    'subcategory.projectManager': 'Project Manager',
    'subcategory.videoStreaming': 'Video Streaming',
    'subcategory.musicStreaming': 'Music Streaming',
    'subcategory.podcasts': 'Podcasts',
    'subcategory.games': 'Games',
    'subcategory.movieDatabase': 'Movie Database',
    'subcategory.fileManager': 'File Manager',
    'subcategory.calculator': 'Calculator',
    'subcategory.calendar': 'Calendar',
    'subcategory.translator': 'Translator',
    'subcategory.converter': 'Converter',
    'subcategory.scanner': 'Scanner',
    'subcategory.healthTracking': 'Health Tracking',
    'subcategory.fitnessTracker': 'Fitness Tracker',
    'subcategory.meditation': 'Meditation',
    'subcategory.sleep': 'Sleep',
    'subcategory.cooking': 'Cooking',
    'subcategory.budgetingTools': 'Budgeting Tools',
    'subcategory.stockTrading': 'Stock Trading',
    'subcategory.bankingApps': 'Banking Apps',
    'subcategory.cryptoTracker': 'Crypto Tracker',
    'subcategory.paymentApps': 'Payment Apps',
    
    // App Descriptions
    'description.generalFeatured': 'Featured for its ease of use and functionality',
    'description.productivityApp': 'Boost your productivity with this intuitive application',
    'description.entertainmentApp': 'Enjoy the best entertainment content',
    'description.socialApp': 'Connect with friends and family',
    'description.educationApp': 'Learn new skills at your own pace',
    'description.utilityApp': 'Essential tool for your daily life',
    'description.financeApp': 'Manage your finances intelligently',
    'description.gameApp': 'Have fun with this addictive game',
    'description.healthApp': 'Improve your well-being with personalized tracking',
    'description.newsApp': 'Stay informed with updated news',
    'description.photoApp': 'Edit and organize your photos like a professional',
    'description.videoApp': 'View and edit videos with ease',
    'description.musicApp': 'Enjoy your favorite music anytime',
    'description.travelApp': 'Plan your trips easily',
    'description.foodApp': 'Discover recipes and culinary tips',
    'description.weatherApp': 'Accurate and updated weather forecast',
    'description.shoppingApp': 'Shop online with exclusive offers',
    
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

    // Error messages
    'error.signout': 'Error signing out',
    'error.delete': 'Error deleting account',
    'error.profile': 'Error updating profile',
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
  // Inicialización segura desde localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'es';
    } catch (e) {
      console.error("Error reading language from localStorage:", e);
      return 'es';
    }
  });

  // Función mejorada para establecer el idioma
  const setLanguage = (newLanguage: Language) => {
    console.log("Setting language to:", newLanguage);
    
    if (newLanguage === language) {
      console.log("Language already set to:", newLanguage);
      return; // Evitar actualizaciones innecesarias
    }
    
    if (newLanguage === 'en' || newLanguage === 'es') {
      try {
        localStorage.setItem('language', newLanguage);
      } catch (e) {
        console.error("Error saving language to localStorage:", e);
      }
      
      setLanguageState(newLanguage);
      
      // Disparar evento para notificar sobre el cambio de idioma
      const event = new CustomEvent('languagechange', { 
        detail: { language: newLanguage } 
      });
      document.dispatchEvent(event);
    } else {
      console.error("Invalid language:", newLanguage);
    }
  };

  // Función de traducción mejorada con manejo de errores
  const t = (key: string): string => {
    if (!key) return '';
    
    try {
      const currentTranslations = translations[language] || translations.es;
      const result = currentTranslations[key as keyof typeof currentTranslations];
      
      if (result === undefined) {
        console.debug(`Missing translation for key: ${key} in ${language}`);
        return key;
      }
      
      return result;
    } catch (e) {
      console.error("Error in translation function:", e);
      return key;
    }
  };

  // Efectos para sincronizar el idioma
  useEffect(() => {
    console.log("Language context initialized with:", language);
    
    // Actualizar el idioma del documento
    document.documentElement.lang = language;
    
    // Añadir información de depuración para cambios de idioma
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language') {
        console.log("Language changed in storage:", e.newValue);
        if (e.newValue === 'en' || e.newValue === 'es') {
          setLanguageState(e.newValue as Language);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar eventos personalizados de cambio de idioma
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("Language change event detected:", customEvent.detail?.language);
      
      // Forzar la actualización de componentes que usan traducciones
      document.querySelectorAll('.theme-text').forEach(el => {
        // Esto fuerza una pequeña actualización del DOM que ayuda a refrescar las traducciones
        el.classList.add('language-updated');
        setTimeout(() => el.classList.remove('language-updated'), 0);
      });
    };
    
    document.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
