
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthenticatedUser = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      console.log('Fetching user session...');
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      if (session?.user?.id) {
        console.log('User is logged in with ID:', session.user.id);
      } else {
        console.log('No active user session found');
      }
    };
    
    fetchUserSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id || 'no user');
      setUserId(session?.user?.id || null);
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log('User signed in, will load favorites');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing favorites');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return userId;
};
