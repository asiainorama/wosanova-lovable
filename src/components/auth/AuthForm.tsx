
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BackgroundType } from '@/contexts/BackgroundContext';

interface AuthFormProps {
  background: BackgroundType;
  authError: string | null;
  inDevMode: boolean;
  isLoading: boolean;
  onGoogleSignIn: () => void;
  onDevModeEnter: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  background,
  authError,
  inDevMode,
  isLoading,
  onGoogleSignIn,
  onDevModeEnter
}) => {
  // Check if background is light
  const isLightBackground = (): boolean => {
    const lightBackgrounds: BackgroundType[] = ['default', 'gradient-green', 'gradient-orange', 'gradient-pink'];
    return lightBackgrounds.includes(background);
  };

  const textColorClass = isLightBackground() ? 'text-gray-800' : 'text-white';
  const buttonColorClass = isLightBackground() 
    ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50' 
    : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700';

  return (
    <div className="max-w-md w-full px-6 py-10 z-10">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
            alt="WosaNova Logo" 
            className="w-24 h-24"
          />
        </div>
        <h1 className="text-4xl font-bold mb-3 gradient-text" style={{
          backgroundImage: 'linear-gradient(90deg, #ff719a 0%, #ffa99f 48%, #ffe29f 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          WosaNova
        </h1>
        <p className="mb-1 text-amber-500 font-normal text-xl">La mejor colección de WebApps del mundo</p>
      </div>
      
      {authError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-white text-sm">
          {authError}
        </div>
      )}
      
      {inDevMode ? (
        <div className="text-center">
          <p className="text-green-500 mb-4">Modo de desarrollo activado</p>
          <Button 
            onClick={onDevModeEnter} 
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
          >
            Entrar en modo desarrollo
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onGoogleSignIn} 
          disabled={isLoading} 
          className={`w-full flex items-center justify-center gap-2 ${buttonColorClass} h-12 text-base`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          )}
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </Button>
      )}
    </div>
  );
};
