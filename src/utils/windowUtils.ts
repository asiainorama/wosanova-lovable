
import { toast } from 'sonner';

// Enhanced window opening function with error handling
export const safeOpenWindow = (url: string) => {
  try {
    // Para la página de inicio, abrimos en la misma ventana en lugar de una pestaña nueva
    if (window.location.pathname === '/') {
      window.location.href = url;
      return;
    }
    
    // Para el resto de páginas, mantenemos el comportamiento anterior
    const newWindow = window.open(
      url, 
      '_blank', 
      'noopener,noreferrer,width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes'
    );
    
    // If the window is null, it might be blocked by popup blockers
    if (!newWindow) {
      console.warn('Window opening was blocked or failed');
      // Fallback - try simple _blank approach
      const fallbackWindow = window.open(url, '_blank');
      
      if (!fallbackWindow) {
        // Both attempts failed, notify the user
        toast.error('No se pudo abrir la aplicación. Por favor, permita ventanas emergentes para este sitio.', {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
        });
        
        // Last resort - change current window location
        if (confirm('¿Quieres abrir la aplicación en esta ventana?')) {
          window.location.href = url;
        }
      } else {
        // Focus the fallback window
        fallbackWindow.focus();
      }
    } else {
      // Focus the new window if successfully opened
      newWindow.focus();
    }
  } catch (error) {
    console.error('Error opening window:', error);
    toast.error('Error al abrir la aplicación', {
      className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
    });
  }
};
