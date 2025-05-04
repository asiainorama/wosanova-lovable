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
      // Get saved preference from localStorage
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      console.log("Initial theme mode from localStorage:", savedMode);
      
      // If a valid mode is saved, use it
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        return savedMode;
      }
      
      // Default to system preference
      console.log("No valid saved preference, defaulting to system");
      return 'system';
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return 'system';
    }
  });

  // Function to get the actual theme based on mode and system preference
  const getEffectiveTheme = React.useCallback((): 'light' | 'dark' => {
    if (mode === 'system') {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    // Otherwise use the explicitly selected mode
    return mode as 'light' | 'dark';
  }, [mode]);

  // Function to actually apply theme changes to DOM
  const applyTheme = React.useCallback(() => {
    console.log("Applying theme based on mode:", mode);
    
    try {
      // Save selection to localStorage
      localStorage.setItem('themeMode', mode);
      
      // Determine the effective theme (accounting for system preference)
      const effectiveTheme = getEffectiveTheme();
      console.log("Effective theme to apply:", effectiveTheme);
      
      // Apply or remove dark mode class
      if (effectiveTheme === 'dark') {
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
        metaColorScheme.setAttribute('content', effectiveTheme);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'color-scheme';
        meta.content = effectiveTheme;
        document.head.appendChild(meta);
      }
      
      // Set the primary color CSS variable with default blue values
      document.documentElement.style.setProperty(
        '--primary', 
        effectiveTheme === 'dark' ? '217 91% 65%' : '217 91% 50%'
      );
      
      // Always white text on colored backgrounds in dark mode
      document.documentElement.style.setProperty(
        '--primary-foreground', 
        effectiveTheme === 'dark' ? '0 0% 100%' : '0 0% 7%'
      );
      
      // Force redraw to refresh UI elements
      const event = new Event('themechange');
      document.dispatchEvent(event);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [mode, getEffectiveTheme]);

  // Apply theme when document visibility changes (to prevent theme from resetting on resume)
  useEffect(() => {
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
    // This helps ensure theme consistency when navigating between pages
    const handleNavigation = () => {
      applyTheme();
    };

    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [applyTheme]);

  // Apply theme when component mounts or when theme state changes
  useEffect(() => {
    console.log("ThemeContext effect running - applying theme:", {mode});
    applyTheme();
  }, [mode, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = React.useCallback((newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setModeState(newMode);
  }, []);

  const toggleMode = React.useCallback(() => {
    const effectiveTheme = getEffectiveTheme();
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", effectiveTheme, "to", newMode);
    setModeState(newMode);
  }, [getEffectiveTheme]);

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
