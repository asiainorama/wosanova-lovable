
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para manejar el comportamiento de scroll basado en la ruta actual
 */
export function useScrollBehavior() {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Limpiar todos los estilos previos
    document.body.style.removeProperty('overflowX');
    document.body.style.removeProperty('overflowY');
    document.body.style.removeProperty('height');
    document.body.style.removeProperty('minHeight');
    
    // Solo aplicar scroll horizontal en la página de inicio
    if (currentPath === '/' || currentPath === '/home') {
      document.body.style.overflowY = 'hidden';
      document.body.style.overflowX = 'auto';
      console.log('Aplicando scroll horizontal para la página de inicio');
    } else {
      // Para todas las demás páginas, permitir scroll vertical normal
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      console.log('Aplicando scroll vertical para:', currentPath);
    }
    
    return () => {
      // Limpiar estilos al desmontar
      document.body.style.removeProperty('overflowX');
      document.body.style.removeProperty('overflowY');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('minHeight');
    };
  }, [location.pathname]);
}
