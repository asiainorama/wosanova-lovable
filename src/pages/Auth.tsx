
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import SpaceBackground from '@/components/SpaceBackground';
import { useTheme } from '@/contexts/ThemeContext';
import { BackgroundType } from '@/contexts/BackgroundContext';
import { shouldSkipAuth } from '@/utils/environmentUtils';

// Background styles copied from BackgroundContext
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

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [inDevMode, setInDevMode] = useState(false);
  const [randomBackground, setRandomBackground] = useState<BackgroundType>('default');
  const {
    mode
  } = useTheme();

  // Determine if we should use dark mode based on the theme context
  const isDarkMode = mode === 'dark' || mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set random background on component mount
  useEffect(() => {
    const backgrounds: BackgroundType[] = ['default', 'gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange', 'gradient-pink'];
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setRandomBackground(backgrounds[randomIndex]);
    
    // Add gradient animations to document if not already present
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

  // Check for existing session and query params on component mount
  useEffect(() => {
    const checkEnvironmentAndSession = async () => {
      try {
        // Check if we're in the Lovable preview environment
        const skipAuth = shouldSkipAuth();
        console.log('Auth page - skipAuth result:', skipAuth);
        setInDevMode(skipAuth);
        
        if (skipAuth) {
          console.log("Running in Lovable preview mode - Bypassing authentication");
          toast.success('Modo de desarrollo detectado - Saltando autenticación', {
            duration: 3000
          });
          
          // Immediately navigate to home page in dev mode
          navigate('/');
          return;
        }

        // Standard authentication flow only if not in dev mode
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Log full URL for debugging
        console.log("Current URL:", window.location.href);
        console.log("Hash params:", Object.fromEntries(hashParams));
        console.log("Query params:", Object.fromEntries(queryParams));

        // Special handling for redirects from OAuth providers
        if (hashParams.has('access_token') || queryParams.has('code')) {
          console.log("Detected auth callback parameters");
          toast.info('Iniciando sesión...', {
            duration: 2000
          });
        }

        // Check for error in the URL (could be from OAuth provider)
        if (queryParams.has('error') || hashParams.has('error')) {
          const errorMsg = queryParams.get('error') || hashParams.get('error') || 'Error desconocido';
          const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
          console.error("Auth error in URL:", errorMsg, errorDescription);
          setAuthError(`Error de autenticación: ${errorDescription || errorMsg}`);
          toast.error(`Error de autenticación: ${errorDescription || errorMsg}`);
        }
        
        const {
          data: {
            session
          },
          error
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error.message);
          toast.error(`Error al verificar sesión: ${error.message}`);
        } else if (session) {
          console.log("Existing session found in Auth page, redirecting");
          navigate('/');
        } else {
          console.log("No session found in Auth page");
        }
      } catch (err) {
        console.error("Unexpected error checking session:", err);
        toast.error('Error inesperado al verificar la sesión');
      } finally {
        setIsAuthenticating(false);
      }
    };
    checkEnvironmentAndSession();
  }, [navigate]);

  // Effect to update the theme when mode changes
  useEffect(() => {
    console.log("Auth page - current theme mode:", mode);
  }, [mode]);
  
  const handleGoogleSignIn = async () => {
    if (inDevMode) {
      // En modo desarrollo, simplemente navegar a la página principal
      toast.success('Modo de desarrollo - Simulando inicio de sesión exitoso', {
        duration: 2000
      });
      navigate('/');
      return;
    }
    
    try {
      setIsLoading(true);
      setAuthError(null);

      // Get the current URL base to use in the redirect
      const origin = window.location.origin;

      // Log information about the redirect URL
      console.log("Current origin:", origin);

      // Ensure we add trailing slash to the redirect URL to avoid path issues
      let redirectTo = `${origin}/`;
      if (!redirectTo.endsWith('/')) {
        redirectTo = `${redirectTo}/`;
      }
      console.log("Starting OAuth flow with redirect to:", redirectTo);
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account' // Force Google to show the account selector
          }
        }
      });
      if (error) {
        console.error("OAuth error:", error.message);
        setAuthError(`Error al conectar con Google: ${error.message}`);
        toast.error(`Error al iniciar sesión con Google: ${error.message}`);
        throw error;
      }
      console.log("OAuth redirect initiated:", data);
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading when checking authentication
  if (isAuthenticating) {
    return <div className="min-h-screen flex flex-col items-center justify-center" style={backgroundStyles[randomBackground]}>
        {randomBackground === 'default' && <SpaceBackground />}
        <div className="z-10 flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-primary animate-spin mb-4" />
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-lg`}>
            {inDevMode ? 'Modo de desarrollo detectado...' : 'Verificando sesión...'}
          </p>
        </div>
      </div>;
  }

  return <div className="min-h-screen flex flex-col items-center justify-center" style={backgroundStyles[randomBackground]}>
      {randomBackground === 'default' && <SpaceBackground />}
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
        
        {authError && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-white text-sm">
            {authError}
          </div>}
        
        {inDevMode ? (
          <div className="text-center">
            <p className="text-green-500 mb-4">Modo de desarrollo activado</p>
            <Button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white h-12 text-base">
              Entrar en modo desarrollo
            </Button>
          </div>
        ) : (
          <Button onClick={handleGoogleSignIn} disabled={isLoading} className={`w-full flex items-center justify-center gap-2 
              ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'} 
              h-12 text-base`}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />}
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </Button>
        )}
      </div>
    </div>;
};

export default Auth;
