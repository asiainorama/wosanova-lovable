
import React, { createContext, useContext, useState, useEffect } from 'react';

// Update ThemeMode to include 'system' as a valid value
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'gray' | 'green' | 'red' | 'pink' | 'orange';

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColorClasses: Record<ThemeColor, { background: string, text: string }> = {
  blue: { 
    background: 'bg-gradient-to-br from-blue-400 to-blue-600', 
    text: 'text-blue-500 dark:text-blue-400'
  },
  gray: { 
    background: 'bg-gradient-to-br from-gray-300 to-gray-500', 
    text: 'text-gray-500 dark:text-gray-400'
  },
  green: { 
    background: 'bg-gradient-to-br from-green-400 to-green-600', 
    text: 'text-green-500 dark:text-green-400'
  },
  red: { 
    background: 'bg-gradient-to-br from-red-400 to-red-600', 
    text: 'text-red-500 dark:text-red-400'
  },
  pink: { 
    background: 'bg-gradient-to-br from-pink-400 to-pink-600', 
    text: 'text-pink-500 dark:text-pink-400'
  },
  orange: { 
    background: 'bg-gradient-to-br from-orange-300 to-orange-500', 
    text: 'text-orange-500 dark:text-orange-400'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with values from localStorage or defaults
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      console.log("Initial theme mode from localStorage:", savedMode);
      return savedMode || 'light';
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return 'light';
    }
  });
  
  const [color, setColorState] = useState<ThemeColor>(() => {
    try {
      const savedColor = localStorage.getItem('themeColor') as ThemeColor;
      console.log("Initial theme color from localStorage:", savedColor);
      return savedColor || 'blue';
    } catch (e) {
      console.error("Error reading color from localStorage:", e);
      return 'blue';
    }
  });

  // Function to actually apply theme changes to DOM
  const applyTheme = React.useCallback((newMode: ThemeMode, newColor: ThemeColor) => {
    console.log("Applying theme:", newMode, newColor);
    
    try {
      // Save to localStorage
      localStorage.setItem('themeMode', newMode);
      localStorage.setItem('themeColor', newColor);
      
      // Apply or remove dark mode class
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
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
      
      // Color mapping with specific HSL values
      const colorMap = {
        blue: { hue: 217, saturation: "91%", lightness: newMode === 'dark' ? "65%" : "50%" },
        gray: { hue: 220, saturation: "13%", lightness: newMode === 'dark' ? "65%" : "50%" },
        green: { hue: 142, saturation: "71%", lightness: newMode === 'dark' ? "65%" : "50%" },
        red: { hue: 0, saturation: "84%", lightness: newMode === 'dark' ? "65%" : "60%" },
        pink: { hue: 322, saturation: "100%", lightness: newMode === 'dark' ? "65%" : "50%" },
        orange: { hue: 24, saturation: "95%", lightness: newMode === 'dark' ? "65%" : "53%" }
      };
      
      const selectedColor = colorMap[newColor] || colorMap.blue;
      
      // Set the primary color CSS variable with adjusted values for dark mode
      document.documentElement.style.setProperty(
        '--primary', 
        `${selectedColor.hue} ${selectedColor.saturation} ${selectedColor.lightness}`
      );
      
      // Always white text on colored backgrounds in dark mode
      document.documentElement.style.setProperty(
        '--primary-foreground', 
        newMode === 'dark' ? '0 0% 100%' : '0 0% 7%'
      );
      
      // Adjust border color for better contrast in dark mode
      document.documentElement.style.setProperty(
        '--primary-border', 
        `${selectedColor.hue} ${selectedColor.saturation} ${newMode === 'dark' ? '80%' : '70%'}`
      );
      
      // Set theme color classes for titles and menu items
      document.documentElement.style.setProperty(
        '--theme-color',
        `hsl(${selectedColor.hue}, ${selectedColor.saturation}, ${selectedColor.lightness})`
      );
      
      // Set all theme colors with appropriate adjustments for dark mode
      const colors = ['blue', 'gray', 'green', 'red', 'pink', 'orange'];
      colors.forEach(c => {
        const color = colorMap[c as ThemeColor];
        
        // Base colors are brighter in dark mode
        document.documentElement.style.setProperty(
          `--${c}-500`, 
          `hsl(${color.hue}, ${color.saturation}, ${color.lightness})`
        );
        
        // Border/highlight colors
        document.documentElement.style.setProperty(
          `--${c}-700`, 
          `hsl(${color.hue}, ${color.saturation}, ${parseFloat(color.lightness) - (newMode === 'dark' ? 5 : 10)}%)`
        );
        
        // Lighter variants for highlights
        document.documentElement.style.setProperty(
          `--${c}-400`, 
          `hsl(${color.hue}, ${color.saturation}, ${parseFloat(color.lightness) + (newMode === 'dark' ? 10 : 10)}%)`
        );
      });

      // Add a new CSS class to the html element for the current theme color
      document.documentElement.classList.remove('theme-blue', 'theme-gray', 'theme-green', 'theme-red', 'theme-pink', 'theme-orange');
      document.documentElement.classList.add(`theme-${newColor}`);
      
      // Force redraw to refresh UI elements
      const event = new Event('themechange');
      document.dispatchEvent(event);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, []);

  // Apply theme when component mounts or when theme state changes
  useEffect(() => {
    console.log("ThemeContext effect running - applying theme:", {mode, color});
    applyTheme(mode, color);
  }, [mode, color, applyTheme]);

  // Wrapper functions to update theme state
  const setMode = React.useCallback((newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setModeState(newMode);
  }, []);

  const setColor = React.useCallback((newColor: ThemeColor) => {
    console.log("Setting color to:", newColor);
    setColorState(newColor);
  }, []);

  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", mode, "to", newMode);
    setModeState(newMode);
  }, [mode]);

  const contextValue = React.useMemo(() => ({
    mode, 
    color, 
    setMode, 
    setColor, 
    toggleMode
  }), [mode, color, setMode, setColor, toggleMode]);

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

export const getThemeColorClass = (colorName: ThemeColor) => {
  return themeColorClasses[colorName];
};

export const getThemeTextColor = (colorName: ThemeColor) => {
  return themeColorClasses[colorName].text;
};
