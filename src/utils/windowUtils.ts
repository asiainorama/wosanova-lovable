
import { toast } from 'sonner';

// Enhanced window opening function with error handling and PWA detection
export const safeOpenWindow = (url: string) => {
  try {
    // Check if we're running as a PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone || 
                  document.referrer.includes('android-app://');
    
    // Check if we're on the home page
    const isHomePage = window.location.pathname === '/';
    
    // For widgets and home page URLs, handle differently based on path
    if (url.startsWith('/widgets/') || window.location.pathname === '/') {
      // If it's widgets, just navigate normally
      if (url.startsWith('/widgets/')) {
        window.location.href = url;
        return;
      }
    }
    
    // Check if it's a mobile device
    const isMobile = window.innerWidth < 768;
    
    // If we're on the home page, open apps as PWA in independent windows
    if (isHomePage && !url.startsWith('/widgets/')) {
      // Try to open as PWA-like window with specific features
      const pwaWindow = window.open(
        url,
        '_blank',
        `width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,left=${(screen.width - 1024) / 2},top=${(screen.height - 768) / 2}`
      );
      
      if (pwaWindow) {
        pwaWindow.focus();
        return;
      } else {
        // Fallback if popup is blocked
        toast.error('No se pudo abrir la aplicación. Por favor, permita ventanas emergentes para este sitio.', {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
        });
        return;
      }
    }
    
    // Special handling for PWA mode - force new windows for external URLs
    if (isPWA && (url.startsWith('http') || url.startsWith('https'))) {
      // For PWAs, we need to be more aggressive about opening new windows
      const newWindow = window.open(
        url,
        '_blank',
        'noopener,noreferrer,width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes,resizable=yes'
      );
      
      if (newWindow) {
        newWindow.focus();
        return;
      } else {
        // If window.open fails in PWA, try alternative approaches
        try {
          // Create a temporary link and click it
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        } catch (linkError) {
          console.warn('Link click method failed:', linkError);
        }
        
        // Last resort for PWA
        toast.error('No se pudo abrir la aplicación. Intenta abrir el enlace manualmente.', {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : ''
        });
        return;
      }
    }
    
    // On mobile, just navigate to the URL in the same window
    if (isMobile && !isPWA) {
      window.location.href = url;
      return;
    }
    
    // On desktop, open in a new window with appropriate dimensions
    const isWidget = url.includes('/widgets/');
    let width = 1200;
    let height = 800;
    
    // Adjust window size for widgets
    if (isWidget) {
      width = 600;
      height = 700;
    }
    
    const newWindow = window.open(
      url, 
      '_blank', 
      `noopener,noreferrer,width=${width},height=${height},menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes`
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
