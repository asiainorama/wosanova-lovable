
import * as React from 'react';
import { ThemeMode } from "@/contexts/ThemeContext";

/**
 * Hook to handle various theme-related side effects
 */
export const useThemeEffect = (mode: ThemeMode, applyTheme: () => void) => {
  // Apply theme when document visibility changes (to prevent theme from resetting on resume)
  React.useEffect(() => {
    // Guard for SSR or non-browser environments
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        applyTheme();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applyTheme]);

  // Listen for system preference changes
  React.useEffect(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        // Only reapply if currently in system mode
        if (mode === 'system') {
          applyTheme();
        }
      };
      
      // Add event listener with proper feature detection
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => {
          mediaQuery.removeListener(handleChange);
        };
      }
    } catch (e) {
      console.error("Error setting up media query listener:", e);
    }
    
    // Return empty cleanup function if we couldn't set up listeners
    return () => {};
  }, [mode, applyTheme]);

  // Special handler for page transitions
  React.useEffect(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined') return;
    
    // This helps ensure theme consistency when navigating between pages
    const handleNavigation = () => {
      applyTheme();
    };

    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [applyTheme]);
};
