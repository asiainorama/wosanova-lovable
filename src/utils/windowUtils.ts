
import { toast } from 'sonner';

// Enhanced window opening function with PWA-like behavior
export const safeOpenWindow = (url: string) => {
  try {
    // For widgets and internal routes, handle differently
    if (url.startsWith('/widgets/')) {
      window.location.href = url;
      return;
    }
    
    // Check if it's a mobile device
    const isMobile = window.innerWidth < 768;
    
    // On mobile, just navigate to the URL in the same window
    if (isMobile) {
      window.location.href = url;
      return;
    }
    
    // On desktop, open in a new window with standalone appearance
    const isWidget = url.includes('/widgets/');
    
    // Default window dimensions
    let width = 1200;
    let height = 800;
    
    // Adjust window size for widgets
    if (isWidget) {
      width = 600;
      height = 700;
    }
    
    // Open with minimal browser UI (as close to PWA as possible)
    const newWindow = window.open(
      url, 
      '_blank', 
      `width=${width},height=${height},location=no,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes`
    );
    
    // If the window is null, it might be blocked by popup blockers
    if (!newWindow) {
      console.warn('Window opening was blocked or failed');
      
      // Try a simpler approach as fallback
      const fallbackWindow = window.open(url, '_blank');
      
      if (!fallbackWindow) {
        // Both attempts failed, notify the user
        toast.error('No se pudo abrir la aplicación. Por favor, permita ventanas emergentes para este sitio.', {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
        });
        
        // Last resort - navigate in current window if user confirms
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
