import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'es';
  setLanguage: (language: 'es') => void;
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
  // Siempre usamos español
  const [language] = useState<'es'>('es');

  // Función para mantener compatibilidad con el resto del código
  const setLanguage = () => {
    // No hace nada, ya que solo tenemos español
    console.log("Idioma fijo en español");
  };

  // Función de traducción simplificada
  const t = (key: string): string => {
    if (!key) return '';
    
    try {
      const currentTranslations = translations.es;
      const result = currentTranslations[key as keyof typeof currentTranslations];
      
      if (result === undefined) {
        console.debug(`Falta traducción para clave: ${key}`);
        return key;
      }
      
      return result;
    } catch (e) {
      console.error("Error en función de traducción:", e);
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
