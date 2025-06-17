
import React from 'react';
import { Loader2 } from 'lucide-react';
import { BackgroundType } from '@/contexts/BackgroundContext';

interface AuthLoadingScreenProps {
  background: BackgroundType;
  inDevMode: boolean;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ background, inDevMode }) => {
  // Check if background is light
  const isLightBackground = (): boolean => {
    const lightBackgrounds: BackgroundType[] = ['default', 'gradient-green', 'gradient-orange', 'gradient-pink'];
    return lightBackgrounds.includes(background);
  };

  const textColorClass = isLightBackground() ? 'text-gray-800' : 'text-white';

  return (
    <div className="z-10 flex flex-col items-center justify-center">
      <Loader2 size={48} className="text-primary animate-spin mb-4" />
      <p className={`${textColorClass} text-lg`}>
        {inDevMode ? 'Modo de desarrollo detectado...' : 'Verificando sesión...'}
      </p>
    </div>
  );
};
