
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { shouldSkipAuth } from '@/utils/environmentUtils';

export const useAppInitialization = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skipAuthCheck, setSkipAuthCheck] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in the preview environment
    const skipAuth = shouldSkipAuth();
    setSkipAuthCheck(skipAuth);
    
    if (skipAuth) {
      console.log("Running in Lovable preview mode - Bypassing auth checks");
      setIsLoading(false);
      return;
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Do NOT force apply theme here - let ThemeProvider handle it
        // This preserves user's selected theme across login/logout events
        console.log("Auth state changed:", event, session ? "user present" : "no user");
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
        } else {
          setSession(data.session);
          console.log("Initial session check:", data.session ? "user present" : "no user");
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading, skipAuthCheck };
};
