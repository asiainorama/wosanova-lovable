
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shouldSkipAuth } from '@/utils/environmentUtils';
import { BackgroundType } from '@/contexts/BackgroundContext';

export const useAuthState = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [inDevMode, setInDevMode] = useState(false);
  const [randomBackground, setRandomBackground] = useState<BackgroundType>('default');

  // Set random background on component mount
  useEffect(() => {
    const backgrounds: BackgroundType[] = ['default', 'gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange', 'gradient-pink'];
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    setRandomBackground(backgrounds[randomIndex]);
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
          data: { session },
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
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

  const handleDevModeEnter = () => {
    navigate('/');
  };

  return {
    isLoading,
    isAuthenticating,
    authError,
    inDevMode,
    randomBackground,
    handleGoogleSignIn,
    handleDevModeEnter
  };
};
