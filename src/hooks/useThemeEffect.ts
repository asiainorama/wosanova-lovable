
import { useEffect } from 'react';
import { ThemeMode } from "@/contexts/ThemeContext";
import { getEffectiveTheme, applyThemeToDocument } from '@/utils/themeUtils';

/**
 * Hook to handle various theme-related side effects
 */
export const useThemeEffect = (mode: ThemeMode, applyTheme: () => void) => {
  // Apply theme when document visibility changes (to prevent theme from resetting on resume)
  useEffect(() => {
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
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only reapply if currently in system mode
      if (mode === 'system') {
        applyTheme();
      }
    };
    
    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [mode, applyTheme]);

  // Special handler for page transitions
  useEffect(() => {
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
