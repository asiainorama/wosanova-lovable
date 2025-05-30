
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ThemeSelector } from '@/components/ThemeSelector';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Rocket, User, Trash2, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeMode } from '@/contexts/ThemeContext';
import Header from '@/components/Header';

// Define profile type based on the actual database structure
interface UserProfile {
  username?: string;
  avatar_url?: string;
  theme_mode?: string;
  background_preference?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { t } = useLanguage();
  const { getBackgroundStyle } = useBackground();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Debounce timer for auto-save
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Get current user details and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        
        // Try to get user profile data from Supabase
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('username, avatar_url, theme_mode, background_preference')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Use type assertion to ensure proper typing
            const profileData = data as unknown as UserProfile;
            setUsername(profileData.username || '');
            setAvatarUrl(profileData.avatar_url || '');
            
            // Only log the user's theme preference, don't force it
            console.log('User has theme_mode stored:', profileData.theme_mode);
            
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
  }, []);

  // Auto-save function with debounce
  const autoSaveChanges = () => {
    // Clear any existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    
    // Set a new timer to save after 1 second of inactivity
    const timer = setTimeout(() => {
      handleSaveProfile();
    }, 1000);
    
    setSaveTimer(timer);
  };
  
  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [saveTimer]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast.error(t('error.signout'));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd add proper account deletion logic here
      await supabase.auth.signOut();
      toast.success(t('profile.deleted'));
      navigate('/auth');
    } catch (error: any) {
      toast.error(t('error.delete'));
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    
    try {
      // Save to Supabase with proper typing
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            id: userId,
            username,
            avatar_url: avatarUrl,
            theme_mode: mode
          }, { 
            onConflict: 'id'
          });
          
        if (error) throw error;
      } catch (error) {
        console.error('Error upserting to user_profiles:', error);
        throw error;
      }
      
      // Save to localStorage as well for immediate use
      localStorage.setItem('username', username);
      localStorage.setItem('avatarUrl', avatarUrl);
      localStorage.setItem('themeMode', mode);
      
      console.log('Profile updated successfully:', { username, avatarUrl, mode });
      // No toast notification for auto-save to avoid interruptions
    } catch (error: any) {
      toast.error(t('error.profile'));
      console.error(error);
    }
  };

  // Updated input handlers to trigger auto-save
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    autoSaveChanges();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    autoSaveChanges();
  };

  // Add useEffect to log whenever mode changes in the profile page
  useEffect(() => {
    console.log('Profile page - current theme mode:', mode);
  }, [mode]);

  return (
    <div className="flex flex-col min-h-screen" style={getBackgroundStyle()}>
      <Header title={t('profile.title')} />
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket size={24} className="text-primary" />
            <h1 className="text-2xl font-bold dark:text-white theme-text">{t('profile.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('profile.description')}</p>

          <div className="space-y-6">
            {/* Profile Section with aligned username and avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/10">
                  <User size={20} />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div>
                  <Label htmlFor="username" className="dark:text-white text-xs">{t('profile.username')}</Label>
                  <Input 
                    id="username" 
                    placeholder={t('profile.username')}
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full h-8 mt-1 text-sm dark:bg-gray-800/50 dark:text-white dark:border-gray-700 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                
                <div className="mt-1">
                  <Label htmlFor="picture" className="dark:text-white text-xs">{t('profile.avatar')}</Label>
                  <Input 
                    id="picture" 
                    type="url" 
                    placeholder={t('profile.avatar')}
                    value={avatarUrl}
                    onChange={handleAvatarChange}
                    className="w-full h-8 mt-1 text-sm dark:bg-gray-800/50 dark:text-white dark:border-gray-700 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            {/* Theme Selector Section */}
            <div>
              <h3 className="text-xs font-medium mb-1 dark:text-white">{t('profile.appearance')}</h3>
              <ThemeSelector onThemeChange={autoSaveChanges} />
            </div>

            <Separator className="my-2" />
            
            {/* Background Selector Section */}
            <div>
              <BackgroundSelector onBackgroundChange={autoSaveChanges} />
            </div>
            
            <Separator className="my-2" />
            
            {/* Actions Section */}
            <div className="pt-1 flex justify-center gap-4">
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="h-9 px-4 text-sm flex items-center gap-2 dark:bg-gray-800/50 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700/50 bg-white/50 backdrop-blur-sm hover:bg-white/70"
              >
                <LogOut size={14} />
                {t('profile.logout')}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="h-9 px-4 text-sm flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    {t('profile.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-800/90 dark:text-white dark:border-gray-700 bg-white/90 backdrop-blur-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">{t('profile.delete.confirm')}</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-300">
                      {t('profile.delete.description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-gray-700/50 dark:text-white dark:hover:bg-gray-600/50 bg-white/50 backdrop-blur-sm hover:bg-white/70">{t('profile.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {t('profile.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
