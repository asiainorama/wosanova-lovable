
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BackgroundType } from '@/contexts/BackgroundContext';
import { lightBackgrounds } from '@/constants/wallpapers';

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
  const isLightBackground = (): boolean => lightBackgrounds.includes(background);

  const light = isLightBackground();
  const textColorClass = light ? 'text-slate-900' : 'text-white';
  const titleShadow = light
    ? '0 1px 2px rgba(255,255,255,0.7)'
    : '0 2px 6px rgba(0,0,0,0.5)';
  const buttonColorClass = light
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
        <h1
          className={`text-4xl font-bold mb-3 tracking-tight ${textColorClass}`}
          style={{ textShadow: titleShadow }}
        >
          WosaNova
        </h1>
        <p
          className={`mb-1 font-normal text-xl ${light ? 'text-slate-700' : 'text-slate-200'}`}
          style={{ textShadow: titleShadow }}
        >
          La mejor colección de WebApps del mundo
        </p>
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
