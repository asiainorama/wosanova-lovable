
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
  const [mode, setMode] = useState<ThemeMode>('light');
  const [color, setColor] = useState<ThemeColor>('blue');

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode') as ThemeMode;
    const storedColor = localStorage.getItem('themeColor') as ThemeColor;
    
    if (storedMode) {
      setMode(storedMode);
    }
    
    if (storedColor) {
      setColor(storedColor);
    }
    
    // Apply initial theme based on stored preferences
    updateTheme(storedMode || mode, storedColor || color);
  }, []);

  // Apply theme changes and save to localStorage
  const updateTheme = (newMode: ThemeMode, newColor: ThemeColor) => {
    console.log("Applying theme:", newMode, newColor);
    
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
      // Create meta tag if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = newMode;
      document.head.appendChild(meta);
    }
    
    // Apply color scheme changes to app theme
    document.documentElement.style.setProperty('--theme-color', newColor);

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
  };

  const handleSetMode = (newMode: ThemeMode) => {
    console.log("Setting mode to:", newMode);
    setMode(newMode);
    updateTheme(newMode, color);
  };

  const handleSetColor = (newColor: ThemeColor) => {
    setColor(newColor);
    updateTheme(mode, newColor);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    console.log("Toggle mode from", mode, "to", newMode);
    setMode(newMode);
    updateTheme(newMode, color);
  };

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      color, 
      setMode: handleSetMode, 
      setColor: handleSetColor, 
      toggleMode 
    }}>
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
