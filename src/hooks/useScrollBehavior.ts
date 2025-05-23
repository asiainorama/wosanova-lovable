
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type ScrollBehaviorType = 'horizontal' | 'vertical';

/**
 * Hook personalizado para manejar el comportamiento de scroll basado en la ruta actual
 * 
 * @returns void
 */
export function useScrollBehavior() {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Determinar el tipo de scroll basado en la ruta actual
    const isHomePage = currentPath === '/' || currentPath === '/home';
    const isManagePage = currentPath === '/manage';
    
    if (isHomePage) {
      // Configuración para página de inicio: scroll horizontal
      document.body.style.overflowY = 'hidden';
      document.body.style.overflowX = 'auto';
      
      console.log('Aplicando scroll horizontal para la página de inicio');
    } else if (isManagePage) {
      // Página de gestión: asegurar scroll vertical
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      
      // Importante: forzar scroll vertical para esta página
      setTimeout(() => {
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
      }, 100);
      
      console.log('Forzando scroll vertical para página de gestión');
    } else {
      // Configuración para otras páginas: scroll vertical
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      
      console.log('Aplicando scroll vertical para:', currentPath);
    }
    
    return () => {
      // Limpiar estilos al desmontar o cambiar de ruta
      document.body.style.removeProperty('overflowX');
      document.body.style.removeProperty('overflowY');
    };
  }, [location.pathname]);
}
