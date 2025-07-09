
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  username?: string;
  avatar_url?: string;
  language?: string;
}

export const useUserProfile = () => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          // Try to get user profile data
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('username, avatar_url, language')
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
              
              // Update language if user has a saved preference
              if (profileData.language) {
                localStorage.setItem('language', profileData.language);
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
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
        localStorage.removeItem('username');
        localStorage.removeItem('avatarUrl');
        // Don't remove language on logout, keep user preference
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (newUsername: string, newAvatarUrl: string) => {
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        username: newUsername,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update local state and localStorage
    setUsername(newUsername);
    setAvatarUrl(newAvatarUrl);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('avatarUrl', newAvatarUrl);
  };

  return { username, avatarUrl, userId, updateProfile };
};
