
import * as React from 'react';
import { getEffectiveTheme, applyThemeToDocument } from '@/utils/themeUtils';
import { useThemeEffect } from '@/hooks/useThemeEffect';

// Update ThemeMode to include 'system' as a valid value
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  effectiveTheme: 'light' | 'dark';
}

// Create a default context value to prevent null context issues
const defaultContextValue: ThemeContextType = {
  mode: 'system',
  setMode: () => {},
  toggleMode: () => {},
  effectiveTheme: 'light'
};

const ThemeContext = React.createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with system preference
  const [mode, setModeState] = React.useState<ThemeMode>('system');

  // Calculate effective theme
  const effectiveTheme = React.useMemo(() => getEffectiveTheme(mode), [mode]);

  // Function to actually apply theme changes to DOM
  const applyTheme = React.useCallback(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    try {
      // Apply theme to document elements
      applyThemeToDocument(effectiveTheme);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [effectiveTheme]);

  // Use custom hook for theme effects
  useThemeEffect(mode, applyTheme);

  // Apply theme when component mounts or when theme state changes
  React.useEffect(() => {
    // Guard for SSR or non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    applyTheme();
  }, [effectiveTheme, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = React.useCallback(() => {
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
    setModeState(newMode);
  }, [effectiveTheme]);

  const contextValue = React.useMemo(() => ({
    mode,
    setMode, 
    toggleMode,
    effectiveTheme
  }), [mode, setMode, toggleMode, effectiveTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return React.useContext(ThemeContext);
};
