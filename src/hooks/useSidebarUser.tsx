
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/sidebar';

export const useSidebarUser = () => {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('avatarUrl') || '');
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        
        // Try to get user profile data
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Type assertion to ensure data is treated as UserProfile
            const profileData = data as unknown as UserProfile;
            setUsername(profileData.username || '');
            setAvatarUrl(profileData.avatar_url || '');
            
            // Also update localStorage for immediate use
            localStorage.setItem('username', profileData.username || '');
            localStorage.setItem('avatarUrl', profileData.avatar_url || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserData();
      } else {
        setUserId(null);
        setUsername('');
        setAvatarUrl('');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userId, username, avatarUrl };
};

export default useSidebarUser;
