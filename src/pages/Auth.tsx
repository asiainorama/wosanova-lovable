
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Rocket } from 'lucide-react';
import SpaceBackground from '@/components/SpaceBackground';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If we already have a session, redirect to the catalog page
        navigate('/catalog');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Get the current URL to use in the redirect
      const origin = window.location.origin;
      
      // Ensure we add trailing slash to the redirect URL to avoid path issues
      let redirectTo = `${origin}/catalog`;
      if (!redirectTo.endsWith('/')) {
        redirectTo = `${redirectTo}/`;
      }
      
      console.log("Starting OAuth flow with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account', // Force Google to show the account selector
          },
          skipBrowserRedirect: false // Ensure browser redirect happens
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Redirección iniciada:", data);
    } catch (error: any) {
      console.error("Error de autenticación:", error);
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <SpaceBackground />
      <div className="max-w-md w-full px-6 py-10 z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <span className="inline-block p-3 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
              <Rocket size={48} className="text-primary animate-pulse" />
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">WosaNova</h1>
          <p className="text-xl text-gray-300 mb-1">
            Bienvenido a la mayor colección de WebApps del mundo
          </p>
        </div>
        
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 h-12 text-base"
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
