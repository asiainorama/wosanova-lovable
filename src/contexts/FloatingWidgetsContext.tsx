
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FloatingWidget {
  id: string;
  type: 'calculator' | 'converter' | 'notes' | 'alarm';
  position: { x: number; y: number };
  zIndex: number;
}

interface FloatingWidgetsContextType {
  widgets: FloatingWidget[];
  openWidget: (type: FloatingWidget['type']) => void;
  closeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  bringToFront: (id: string) => void;
}

const FloatingWidgetsContext = createContext<FloatingWidgetsContextType | undefined>(undefined);

export const useFloatingWidgets = () => {
  const context = useContext(FloatingWidgetsContext);
  if (!context) {
    throw new Error('useFloatingWidgets must be used within a FloatingWidgetsProvider');
  }
  return context;
};

export const FloatingWidgetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<FloatingWidget[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWidget = (type: FloatingWidget['type']) => {
    // Check if widget is already open
    const existingWidget = widgets.find(w => w.type === type);
    if (existingWidget) {
      bringToFront(existingWidget.id);
      return;
    }

    // Create new widget with random position
    const newWidget: FloatingWidget = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 200 + 50, // Random position but not too close to edges
        y: Math.random() * 200 + 50
      },
      zIndex: nextZIndex
    };

    setWidgets(prev => [...prev, newWidget]);
    setNextZIndex(prev => prev + 1);
  };

  const closeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidgetPosition = (id: string, position: { x: number; y: number }) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const bringToFront = (id: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  return (
    <FloatingWidgetsContext.Provider value={{
      widgets,
      openWidget,
      closeWidget,
      updateWidgetPosition,
      bringToFront
    }}>
      {children}
    </FloatingWidgetsContext.Provider>
  );
};
