
import React, { createContext, useContext, useState, useEffect } from 'react';

// Update ThemeMode to include 'system' as a valid value
export type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = 'blue' | 'gray' | 'green' | 'red' | 'pink' | 'orange';

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
    text: 'text-white'
  },
  gray: { 
    background: 'bg-gradient-to-br from-gray-300 to-gray-500', 
    text: 'text-white'
  },
  green: { 
    background: 'bg-gradient-to-br from-green-400 to-green-600', 
    text: 'text-white'
  },
  red: { 
    background: 'bg-gradient-to-br from-red-400 to-red-600', 
    text: 'text-white'
  },
  pink: { 
    background: 'bg-gradient-to-br from-pink-400 to-pink-600', 
    text: 'text-white'
  },
  orange: { 
    background: 'bg-gradient-to-br from-orange-300 to-orange-500', 
    text: 'text-white'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with values from localStorage or defaults
  const [mode, setModeInternal] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('themeMode') as ThemeMode;
      console.log("Initial theme mode from localStorage:", savedMode);
      return savedMode || 'light';
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return 'light';
    }
  });
  
  const [color, setColorInternal] = useState<ThemeColor>(() => {
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
      
      // Apply primary color based on selected color
      const colorMap = {
        blue: { hue: 217, saturation: "91.2%", lightness: "59.8%" },
        gray: { hue: 220, saturation: "13%", lightness: "50%" },
        green: { hue: 142, saturation: "71.4%", lightness: "49.8%" },
        red: { hue: 0, saturation: "84.2%", lightness: "60.2%" },
        pink: { hue: 322, saturation: "100%", lightness: "50%" },
        orange: { hue: 24, saturation: "95%", lightness: "53%" }
      };
      
      const selectedColor = colorMap[newColor] || colorMap.blue;
      document.documentElement.style.setProperty('--primary', `${selectedColor.hue} ${selectedColor.saturation} ${selectedColor.lightness}`);
      
      // Force redraw on theme change to refresh icons and UI elements
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

  // Wrapper functions to update theme state with debounce
  const setMode = React.useCallback((newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setModeInternal(newMode);
  }, []);

  const setColor = React.useCallback((newColor: ThemeColor) => {
    console.log("Setting color to:", newColor);
    setColorInternal(newColor);
  }, []);

  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", mode, "to", newMode);
    setModeInternal(newMode);
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
