
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook simplificado para manejar scroll solo cuando es necesario
 */
export function useScrollBehavior() {
  const location = useLocation();
  
  useEffect(() => {
    // Solo aplicar en la página de inicio y solo para desktop
    if ((location.pathname === '/' || location.pathname === '/home') && window.innerWidth > 768) {
      // Permitir scroll horizontal en desktop para el carrusel
      document.body.style.overflowX = 'auto';
      console.log('Scroll horizontal habilitado para desktop en home');
    } else {
      // Para todo lo demás, scroll normal
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
    }
    
    return () => {
      // Restaurar scroll normal al limpiar
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
    };
  }, [location.pathname]);
}
