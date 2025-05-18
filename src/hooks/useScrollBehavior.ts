
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type ScrollBehaviorType = 'horizontal' | 'vertical';

/**
 * Hook personalizado para manejar el comportamiento de scroll basado en la ruta actual
 * 
 * @param defaultType - Tipo de scroll por defecto
 * @returns void
 */
export function useScrollBehavior() {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Determinar el tipo de scroll basado en la ruta actual
    const isHomePage = currentPath === '/' || currentPath === '/home';
    
    if (isHomePage) {
      // Configuración para página de inicio: scroll horizontal
      document.body.style.overflowY = 'hidden';
      document.body.style.overflowX = 'auto';
      
      console.log('Aplicando scroll horizontal para la página de inicio');
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
