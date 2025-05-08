
/**
 * Utility functions for theme management
 */

import { ThemeMode } from "@/contexts/ThemeContext";

/**
 * Get the effective theme (light or dark) based on mode and system preference
 */
export const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }
  
  if (mode === 'system') {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  // Otherwise use the explicitly selected mode
  return mode as 'light' | 'dark';
};

/**
 * Apply theme to document by adding/removing classes and setting CSS variables
 */
export const applyThemeToDocument = (effectiveTheme: 'light' | 'dark'): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return; // Don't try to access document in SSR
  }
  
  try {
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
};
