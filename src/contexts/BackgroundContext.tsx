
import React, { createContext, useContext, useState, useEffect } from 'react';

type BackgroundType = 'default' | 'pastel' | 'gray' | 'mango' | 'pink-orange' | 'green-blue';

interface BackgroundContextType {
  background: BackgroundType;
  setBackground: (bg: BackgroundType) => void;
  getBackgroundStyle: () => React.CSSProperties;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [background, setBackgroundState] = useState<BackgroundType>('default');

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('backgroundPreference') as BackgroundType;
    if (saved) {
      setBackgroundState(saved);
      console.log('Cargando fondo guardado:', saved);
    }
  }, []);

  const setBackground = (bg: BackgroundType) => {
    setBackgroundState(bg);
    localStorage.setItem('backgroundPreference', bg);
    console.log('Fondo actualizado a:', bg);
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background) {
      case 'pastel':
        return { 
          background: 'linear-gradient(135deg, #fef7cd 0%, #f9a8d4 50%, #d8b4fe 100%)'
        };
      case 'gray':
        return { 
          background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #4b5563 100%)'
        };
      case 'mango':
        return { 
          background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)'
        };
      case 'pink-orange':
        return { 
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #fb923c 100%)'
        };
      case 'green-blue':
        return { 
          background: 'linear-gradient(135deg, #86efac 0%, #2dd4bf 50%, #3b82f6 100%)'
        };
      default:
        return { 
          backgroundImage: 'url(/lovable-uploads/6a5b9b5f-b488-4e38-9dc2-fc56fc85bfd9.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground, getBackgroundStyle }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
