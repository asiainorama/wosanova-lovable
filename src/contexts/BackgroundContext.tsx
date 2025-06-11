
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BackgroundType = 'default' | 'gradient-blue' | 'gradient-purple' | 'gradient-green' | 'gradient-orange' | 'gradient-pink';

interface BackgroundContextType {
  background: BackgroundType;
  setBackground: (background: BackgroundType) => void;
  getBackgroundStyle: () => React.CSSProperties;
  isLightBackground: () => boolean;
}

const backgroundStyles: Record<BackgroundType, React.CSSProperties> = {
  default: {
    backgroundImage: 'url(/lovable-uploads/6a5b9b5f-b488-4e38-9dc2-fc56fc85bfd9.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  },
  'gradient-blue': {
    background: 'linear-gradient(135deg, #667eea, #764ba2, #5a67d8, #667eea)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 12s ease infinite'
  },
  'gradient-purple': {
    background: 'linear-gradient(135deg, #f093fb, #f5576c, #c084fc, #f093fb)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 15s ease infinite'
  },
  'gradient-green': {
    background: 'linear-gradient(135deg, #4facfe, #00f2fe, #38bdf8, #4facfe)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 10s ease infinite'
  },
  'gradient-orange': {
    background: 'linear-gradient(135deg, #fa709a, #fee140, #fb923c, #fa709a)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 14s ease infinite'
  },
  'gradient-pink': {
    background: 'linear-gradient(135deg, #a8edea, #fed6e3, #fda4af, #a8edea)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 13s ease infinite'
  }
};

// Fondos que se consideran claros y necesitan texto oscuro
const lightBackgrounds: BackgroundType[] = ['default', 'gradient-green', 'gradient-orange', 'gradient-pink'];

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [background, setBackgroundState] = useState<BackgroundType>('default');

  // Añadir los keyframes de animación al document cuando el componente se monta
  useEffect(() => {
    // Verificar si ya existen los estilos para evitar duplicados
    if (!document.getElementById('gradient-animations')) {
      const style = document.createElement('style');
      style.id = 'gradient-animations';
      style.textContent = `
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Load background preference on mount
  useEffect(() => {
    const loadBackgroundPreference = async () => {
      try {
        // First try localStorage
        const savedBackground = localStorage.getItem('backgroundPreference') as BackgroundType;
        if (savedBackground && savedBackground in backgroundStyles) {
          setBackgroundState(savedBackground);
          return;
        }

        // Then try Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('background_preference')
            .eq('id', session.user.id)
            .single();
          
          if (!error && data?.background_preference && data.background_preference in backgroundStyles) {
            setBackgroundState(data.background_preference as BackgroundType);
            localStorage.setItem('backgroundPreference', data.background_preference);
          }
        }
      } catch (error) {
        console.error('Error loading background preference:', error);
      }
    };

    loadBackgroundPreference();
  }, []);

  const setBackground = async (newBackground: BackgroundType) => {
    console.log('Setting new background:', newBackground);
    setBackgroundState(newBackground);
    localStorage.setItem('backgroundPreference', newBackground);

    // Save to Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_profiles')
          .upsert({ 
            id: session.user.id,
            background_preference: newBackground
          }, { 
            onConflict: 'id'
          });
      }
    } catch (error) {
      console.error('Error saving background preference:', error);
    }
  };

  const getBackgroundStyle = () => {
    return backgroundStyles[background];
  };

  const isLightBackground = () => {
    return lightBackgrounds.includes(background);
  };

  return (
    <BackgroundContext.Provider value={{ background, setBackground, getBackgroundStyle, isLightBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};
