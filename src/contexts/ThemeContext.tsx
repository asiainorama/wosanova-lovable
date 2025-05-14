
import * as React from 'react';
import { getEffectiveTheme, applyThemeToDocument } from '@/utils/themeUtils';
import { useThemeEffect } from '@/hooks/useThemeEffect';

// Update ThemeMode to include 'system' as a valid value
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

// Create a default context value to prevent null context issues
const defaultContextValue: ThemeContextType = {
  mode: 'system',
  setMode: () => {},
  toggleMode: () => {}
};

const ThemeContext = React.createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with values from localStorage or defaults
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'system';
    }
    
    try {
      // Get saved preference from localStorage
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      
      // If a valid mode is saved, use it
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        return savedMode;
      }
      
      // Default to system preference
      return 'system';
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return 'system';
    }
  });

  // Function to actually apply theme changes to DOM
  const applyTheme = React.useCallback(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    try {
      // Save selection to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('themeMode', mode);
      }
      
      // Determine the effective theme (accounting for system preference)
      const effectiveTheme = getEffectiveTheme(mode);
      
      // Apply theme to document elements
      applyThemeToDocument(effectiveTheme);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [mode]);

  // Use custom hook for theme effects
  useThemeEffect(mode, applyTheme);

  // Apply theme when component mounts or when theme state changes
  React.useEffect(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    applyTheme();
  }, [mode, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = React.useCallback(() => {
    const effectiveTheme = getEffectiveTheme(mode);
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
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
  return React.useContext(ThemeContext);
};
