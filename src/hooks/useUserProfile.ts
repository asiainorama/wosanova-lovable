
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUserId(null);
          setUsername('');
          setAvatarUrl('');
          return;
        }

        const user = session.user;
        setUserId(user.id);

        // Try to get profile from database first
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        // Use Google data if available and no profile exists, or if profile is empty
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const finalUsername = profile?.username || googleName || '';
        const finalAvatarUrl = profile?.avatar_url || googleAvatar || '';

        setUsername(finalUsername);
        setAvatarUrl(finalAvatarUrl);

        // If we got Google data and no profile exists, create/update the profile
        if ((googleName || googleAvatar) && (!profile || !profile.username || !profile.avatar_url)) {
          await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              username: finalUsername,
              avatar_url: finalAvatarUrl
            });
        }

      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setUsername('');
        setAvatarUrl('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (newUsername: string, newAvatarUrl: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          username: newUsername,
          avatar_url: newAvatarUrl
        });

      if (error) throw error;

      setUsername(newUsername);
      setAvatarUrl(newAvatarUrl);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userId,
    username,
    avatarUrl,
    updateProfile,
    isLoading
  };
};
