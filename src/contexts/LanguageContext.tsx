
import * as React from 'react';

interface LanguageContextType {
  language: 'es' | 'en';
  setLanguage: (language: 'es' | 'en') => void;
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
    
    // Installation Prompt
    'install.title': 'Instalar',
    'install.message': 'Descárgate ya la App!!',
    'install.button': 'VAMOS',
    
    // Catalog Page
    'catalog.title': 'Catálogo',
    'catalog.applications': 'Aplicaciones',
    'catalog.search': 'Buscar aplicaciones...',
    'catalog.searchAndFilter': 'Buscar y Filtrar',
    'catalog.allCategories': 'Todas las categorías',
    'catalog.featured': 'Destacadas',
    'catalog.allApps': 'Todas las aplicaciones',
    'catalog.results': 'Resultados',
    'catalog.gridView': 'Vista de cuadrícula',
    'catalog.listView': 'Vista de lista',
    'catalog.category': 'Categoría',
    'catalog.categoryGroup': 'Grupo de categoría',
    'catalog.visit': 'Visitar',
    'catalog.filterByCategory': 'Filtrar por categoría...',
    
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
    'profile.view': 'Ver perfil',
    'profile.chooseStyle': 'Elige tu estilo',
    'profile.wallpaper': 'Fondo de pantalla',
    'profile.wallpaper.none': 'Ninguno',
    'profile.wallpaper.gradient': 'Gradiente',
    'profile.wallpaper.space': 'Espacio',
    'profile.wallpaper.abstract': 'Abstracto',
    
    // Sidebar & Widgets
    'sidebar.calendar': 'Calendario',
    'sidebar.time': 'Hora',
    'sidebar.weather': 'El Tiempo',
    'widget.calculator': 'Calculadora',
    'widget.notes': 'Notas',
    'widget.alarm': 'Alarma',
    'widget.converter': 'Conversor',
    'notes.title': 'Mis Notas',
    'notes.newNote': 'Nueva Nota',
    'notes.untitled': 'Sin título',
    'notes.save': 'Guardar',
    'notes.delete': 'Eliminar',
    'notes.content': 'Contenido de la nota...',
    'calculator.title': 'Calculadora',
    'alarm.title': 'Alarma',
    'alarm.setTime': 'Establecer hora',
    'alarm.start': 'Iniciar',
    'alarm.stop': 'Detener',
    'converter.title': 'Conversor de Unidades',
    
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
    'category.comunicación': 'Comunicación',
    'category.creatividad': 'Creatividad',
    'category.comercio electrónico': 'Comercio electrónico',
    'category.noticias e información': 'Noticias e información',
    'category.redes sociales': 'Redes sociales',
    
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
    
    // Subcategories
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
    'app.description': 'The world\'s largest collection of WebApps',
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
    
    // Installation Prompt
    'install.title': 'Install',
    'install.message': 'Download the App now!!',
    'install.button': 'LET\'S GO',
    
    // Catalog Page
    'catalog.title': 'Catalog',
    'catalog.applications': 'Applications',
    'catalog.search': 'Search applications...',
    'catalog.searchAndFilter': 'Search and Filter',
    'catalog.allCategories': 'All categories',
    'catalog.featured': 'Featured',
    'catalog.allApps': 'All applications',
    'catalog.results': 'Results',
    'catalog.gridView': 'Grid view',
    'catalog.listView': 'List view',
    'catalog.category': 'Category',
    'catalog.categoryGroup': 'Category group',
    'catalog.visit': 'Visit',
    'catalog.filterByCategory': 'Filter by category...',
    
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
    'profile.logout': 'Sign out',
    'profile.delete': 'Delete my account',
    'profile.delete.confirm': 'Are you sure?',
    'profile.delete.description': 'This action cannot be undone. Your account and all associated data will be permanently deleted.',
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
    'profile.deleted': 'Account deleted successfully',
    'profile.view': 'View profile',
    'profile.chooseStyle': 'Choose your style',
    'profile.wallpaper': 'Wallpaper',
    'profile.wallpaper.none': 'None',
    'profile.wallpaper.gradient': 'Gradient',
    'profile.wallpaper.space': 'Space',
    'profile.wallpaper.abstract': 'Abstract',
    
    // Sidebar & Widgets
    'sidebar.calendar': 'Calendar',
    'sidebar.time': 'Time',
    'sidebar.weather': 'Weather',
    'widget.calculator': 'Calculator',
    'widget.notes': 'Notes',
    'widget.alarm': 'Alarm',
    'widget.converter': 'Converter',
    'notes.title': 'My Notes',
    'notes.newNote': 'New Note',
    'notes.untitled': 'Untitled',
    'notes.save': 'Save',
    'notes.delete': 'Delete',
    'notes.content': 'Note content...',
    'calculator.title': 'Calculator',
    'alarm.title': 'Alarm',
    'alarm.setTime': 'Set time',
    'alarm.start': 'Start',
    'alarm.stop': 'Stop',
    'converter.title': 'Unit Converter',
    
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
    'category.comunicación': 'Communication',
    'category.creatividad': 'Creativity',
    'category.comercio electrónico': 'E-commerce',
    'category.noticias e información': 'News & Information',
    'category.redes sociales': 'Social Networks',
    
    // App Info
    'app.info.category': 'Category',
    'app.info.rating': 'Rating',
    'app.info.author': 'Creator',
    'app.info.lastUpdate': 'Last update',
    'app.info.size': 'Size',
    'app.info.languages': 'Languages',
    'app.info.platforms': 'Platforms',
    'app.info.description': 'Description',
    'app.info.features': 'Features',
    'app.info.reviews': 'Reviews',
    'app.info.screenshots': 'Screenshots',
    'app.info.relatedApps': 'Related applications',
    
    // Subcategories
    'subcategory.officeSuite': 'Office Suite',
    'subcategory.documentEditing': 'Document Editing',
    'subcategory.spreadsheets': 'Spreadsheets',
    'subcategory.presentations': 'Presentations',
    'subcategory.notesTaking': 'Note Taking',
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
    'description.healthApp': 'Improve your wellbeing with personalized tracking',
    'description.newsApp': 'Stay informed with updated news',
    'description.photoApp': 'Edit and organize your photos professionally',
    'description.videoApp': 'View and edit videos with ease',
    'description.musicApp': 'Enjoy your favorite music anytime',
    'description.travelApp': 'Plan your trips easily',
    'description.foodApp': 'Discover recipes and culinary tips',
    'description.weatherApp': 'Accurate and updated weather forecast',
    'description.shoppingApp': 'Shop online with exclusive offers',
    
    // Auth page
    'auth.welcome': 'Welcome to WosaNova',
    'auth.description': 'Sign in or register to continue',
    'auth.login': 'Sign in',
    'auth.signup': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.remember': 'Remember me',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
    
    // Error messages
    'error.signout': 'Error signing out',
    'error.delete': 'Error deleting account',
    'error.profile': 'Error updating profile',
  }
};

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

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
