
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  'gradient-purple': {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  'gradient-green': {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  'gradient-orange': {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  'gradient-pink': {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
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
