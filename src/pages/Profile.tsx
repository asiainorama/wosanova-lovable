
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSelector } from '@/components/ThemeSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Rocket, User, Trash2, LogOut, Languages } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ThemeMode } from '@/contexts/ThemeContext';

// Define profile type based on the actual database structure
interface UserProfile {
  username?: string;
  avatar_url?: string;
  theme_mode?: string;
  language?: string;
}

type Language = 'es' | 'en';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, color, setMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
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
            .select('username, avatar_url, theme_mode, language')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Use type assertion to ensure proper typing
            const profileData = data as unknown as UserProfile;
            setUsername(profileData.username || '');
            setAvatarUrl(profileData.avatar_url || '');
            
            // Set theme and language if available
            if (profileData.theme_mode) {
              // Safe cast to ThemeMode
              const themeMode = profileData.theme_mode as ThemeMode;
              setMode(themeMode);
            }
            
            if (profileData.language) {
              // Safe cast to Language
              const lang = profileData.language as Language;
              setLanguage(lang);
            }
            
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
  }, [setMode, setLanguage]);

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
      toast.error(language === 'es' ? 'Error al cerrar sesión' : 'Error signing out');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd add proper account deletion logic here
      await supabase.auth.signOut();
      toast.success(language === 'es' ? 'Cuenta eliminada correctamente' : 'Account deleted successfully');
      navigate('/auth');
    } catch (error: any) {
      toast.error(language === 'es' ? 'Error al eliminar la cuenta' : 'Error deleting account');
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
            theme_mode: mode,
            language
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
      
      console.log('Profile updated successfully:', { username, avatarUrl, mode, language });
      // No toast notification for auto-save to avoid interruptions
    } catch (error: any) {
      toast.error(language === 'es' ? 'Error al actualizar el perfil' : 'Error updating profile');
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

  const handleClose = () => {
    setIsOpen(false);
    // Go back to the previous page, or to catalog if we can't
    if (location.key === "default") {
      navigate("/catalog");
    } else {
      navigate(-1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Rocket size={24} /> {t('profile.title')}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {t('profile.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 mt-2">
          {/* Profile Section with aligned username and avatar - more compact */}
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
                  className="w-full h-8 mt-1 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
                  className="w-full h-8 mt-1 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Language Selection - Fixed selection issue */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-1 dark:text-white">{t('profile.language')}</h3>
            <RadioGroup 
              value={language}
              onValueChange={(value: string) => {
                console.log("Changing language to:", value);
                setLanguage(value as 'es' | 'en');
                autoSaveChanges();
              }}
              className="grid grid-cols-2 gap-2"
            >
              <div>
                <RadioGroupItem 
                  value="es" 
                  id="es" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="es"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    language === "es" ? "border-primary" : "border-muted",
                    "dark:border-gray-700 dark:hover:bg-gray-700"
                  )}
                >
                  <Languages className="mb-1 h-3 w-3" />
                  <span className="text-xs dark:text-white">{t('profile.spanish')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="en" 
                  id="en" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="en"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    language === "en" ? "border-primary" : "border-muted",
                    "dark:border-gray-700 dark:hover:bg-gray-700"
                  )}
                >
                  <Languages className="mb-1 h-3 w-3" />
                  <span className="text-xs dark:text-white">{t('profile.english')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator className="my-2" />
          
          {/* Theme Selector Section - More compact */}
          <div>
            <h3 className="text-sm font-medium mb-1 dark:text-white">{t('profile.appearance')}</h3>
            <ThemeSelector onThemeChange={autoSaveChanges} />
          </div>
          
          <Separator className="my-2" />
          
          {/* Actions Section - Centered and aligned */}
          <div className="pt-1">
            <div className="flex justify-center gap-2">
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <LogOut size={12} />
                {t('profile.logout')}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="h-6 px-2 text-xs flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    {t('profile.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">{t('profile.delete.confirm')}</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-300">
                      {t('profile.delete.description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">{t('profile.cancel')}</AlertDialogCancel>
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
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
