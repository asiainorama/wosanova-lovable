
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Rocket } from 'lucide-react';
import SpaceBackground from '@/components/SpaceBackground';
import { useTheme } from '@/contexts/ThemeContext';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { mode } = useTheme();
  
  // Determine if we should use dark mode based on the theme context
  const isDarkMode = mode === 'dark' || 
                    (mode === 'system' && 
                     window.matchMedia && 
                     window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Check for existing session and query params on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check URL for auth callback
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
    checkSession();
  }, [navigate]);

  // Effect to update the theme when mode changes
  useEffect(() => {
    console.log("Auth page - current theme mode:", mode);
  }, [mode]);

  const handleGoogleSignIn = async () => {
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
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <SpaceBackground />
        <div className="z-10 flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-primary animate-spin mb-4" />
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-lg`}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SpaceBackground />
      <div className="max-w-md w-full px-6 py-10 z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <span className="inline-block p-3 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
              <Rocket size={48} className="text-primary animate-pulse" />
            </span>
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
          <p className="text-xl text-gray-300 mb-1">La mejor colección de WebApps del mundo</p>
        </div>
        
        {authError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-white text-sm">
            {authError}
          </div>
        )}
        
        <Button 
          onClick={handleGoogleSignIn} 
          disabled={isLoading} 
          className={`w-full flex items-center justify-center gap-2 
            ${isDarkMode ? 
              'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 
              'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'} 
            h-12 text-base`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          )}
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </Button>
      </div>
    </div>
  );
};

export default Auth;
