
import React, { createContext, useContext, useState, useEffect } from 'react';

// Update ThemeMode to include 'system' as a valid value
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with values from localStorage or defaults
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      // Check for system preference first if no localStorage value
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      console.log("Initial theme mode from localStorage:", savedMode);
      
      if (savedMode) {
        return savedMode;
      }
      
      // If no saved preference, check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log("Using system preference: dark");
        return 'dark';
      }
      
      // Default to light mode
      console.log("No preference found, defaulting to light mode");
      return 'light';
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return 'light';
    }
  });

  // Function to actually apply theme changes to DOM
  const applyTheme = React.useCallback((newMode: ThemeMode) => {
    console.log("Applying theme:", newMode);
    
    try {
      // Save to localStorage
      localStorage.setItem('themeMode', newMode);
      
      // Apply or remove dark mode class
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        
        // Update theme-color meta tag for dark mode
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', '#1f2937');
        }
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        
        // Update theme-color meta tag for light mode
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', '#f3f4f6');
        }
      }
  
      // Apply color scheme meta tag
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) {
        metaColorScheme.setAttribute('content', newMode);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'color-scheme';
        meta.content = newMode;
        document.head.appendChild(meta);
      }
      
      // Set the primary color CSS variable with default blue values
      document.documentElement.style.setProperty(
        '--primary', 
        newMode === 'dark' ? '217 91% 65%' : '217 91% 50%'
      );
      
      // Always white text on colored backgrounds in dark mode
      document.documentElement.style.setProperty(
        '--primary-foreground', 
        newMode === 'dark' ? '0 0% 100%' : '0 0% 7%'
      );
      
      // Force redraw to refresh UI elements
      const event = new Event('themechange');
      document.dispatchEvent(event);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, []);

  // Apply theme when document visibility changes (to prevent theme from resetting on resume)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode && savedMode !== mode) {
          setModeState(savedMode);
        } else {
          // Re-apply current mode to ensure consistency
          applyTheme(mode);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't explicitly chosen a theme
      const savedMode = localStorage.getItem('themeMode');
      if (!savedMode || savedMode === 'system') {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // Special handler for page transitions
  useEffect(() => {
    // This helps ensure theme consistency when navigating between pages
    const handleNavigation = () => {
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      if (savedMode) {
        applyTheme(savedMode);
      }
    };

    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [applyTheme]);

  // Apply theme when component mounts or when theme state changes
  useEffect(() => {
    console.log("ThemeContext effect running - applying theme:", {mode});
    applyTheme(mode);
  }, [mode, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = React.useCallback((newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setModeState(newMode);
  }, []);

  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", mode, "to", newMode);
    setModeState(newMode);
  }, [mode]);

  const contextValue = React.useMemo(() => ({
    mode,
    setMode, 
    toggleMode
  }), [mode, setMode, toggleMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
