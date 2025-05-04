
import React, { createContext, useContext, useState, useEffect } from 'react';

type BackgroundContextType = {
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
};

const BackgroundContext = createContext<BackgroundContextType>({
  backgroundUrl: null,
  setBackgroundUrl: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(() => {
    const savedBackground = localStorage.getItem('backgroundUrl');
    return savedBackground || null;
  });

  useEffect(() => {
    if (backgroundUrl) {
      localStorage.setItem('backgroundUrl', backgroundUrl);
    } else {
      localStorage.removeItem('backgroundUrl');
    }
  }, [backgroundUrl]);

  return (
    <BackgroundContext.Provider value={{ backgroundUrl, setBackgroundUrl }}>
      {children}
    </BackgroundContext.Provider>
  );
};
