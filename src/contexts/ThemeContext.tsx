
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getEffectiveTheme, applyThemeToDocument } from '@/utils/themeUtils';
import { useThemeEffect } from '@/hooks/useThemeEffect';

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
    if (typeof window === 'undefined') {
      return 'system'; // Default for SSR
    }
    
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

  // Function to actually apply theme changes to DOM
  const applyTheme = useCallback(() => {
    if (typeof window === 'undefined') return; // Guard for SSR
    
    console.log("Applying theme based on mode:", mode);
    
    try {
      // Save selection to localStorage
      localStorage.setItem('themeMode', mode);
      
      // Determine the effective theme (accounting for system preference)
      const effectiveTheme = getEffectiveTheme(mode);
      console.log("Effective theme to apply:", effectiveTheme);
      
      // Apply theme to document elements
      applyThemeToDocument(effectiveTheme);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [mode]);

  // Use custom hook for theme effects
  useThemeEffect(mode, applyTheme);

  // Apply theme when component mounts or when theme state changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR
    
    console.log("ThemeContext effect running - applying theme:", {mode});
    applyTheme();
  }, [mode, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = useCallback((newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const effectiveTheme = getEffectiveTheme(mode);
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", effectiveTheme, "to", newMode);
    setModeState(newMode);
  }, [mode]);

  const contextValue = useMemo(() => ({
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
