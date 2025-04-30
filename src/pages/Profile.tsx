
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

// Define profile type based on the actual database structure
interface UserProfile {
  username?: string;
  avatar_url?: string;
  theme_mode?: string;
  language?: string;
}

type ThemeMode = 'light' | 'dark' | 'system';
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
            const profileData = data as UserProfile;
            setUsername(profileData.username || '');
            setAvatarUrl(profileData.avatar_url || '');
            
            // Set theme and language if available
            if (profileData.theme_mode) {
              setMode(profileData.theme_mode as ThemeMode);
            }
            
            if (profileData.language) {
              setLanguage(profileData.language as Language);
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
      // Save to Supabase
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            id: userId,
            username,
            avatar_url: avatarUrl,
            theme_mode: mode,
            language: language
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
      
      toast.success(language === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully');
    } catch (error: any) {
      toast.error(language === 'es' ? 'Error al actualizar el perfil' : 'Error updating profile');
      console.error(error);
    }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Rocket size={24} /> {t('profile.title')}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {t('profile.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          {/* Profile Section with aligned username and avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10">
                <User size={36} />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div>
                <Label htmlFor="username" className="dark:text-white">{t('profile.username')}</Label>
                <Input 
                  id="username" 
                  placeholder={t('profile.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="mt-4">
                <Label htmlFor="picture" className="dark:text-white">{t('profile.avatar')}</Label>
                <Input 
                  id="picture" 
                  type="url" 
                  placeholder={t('profile.avatar')}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full mt-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Language Selection */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-4 dark:text-white">{t('profile.language')}</h3>
            <RadioGroup 
              value={language}
              onValueChange={(value) => setLanguage(value as 'es' | 'en')}
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
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                    language === "es" ? "border-primary" : "border-muted",
                    "dark:border-gray-700 dark:hover:bg-gray-700"
                  )}
                >
                  <Languages className="mb-3 h-6 w-6" />
                  <span className="dark:text-white">{t('profile.spanish')}</span>
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
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                    language === "en" ? "border-primary" : "border-muted",
                    "dark:border-gray-700 dark:hover:bg-gray-700"
                  )}
                >
                  <Languages className="mb-3 h-6 w-6" />
                  <span className="dark:text-white">{t('profile.english')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator className="my-4" />
          
          {/* Theme Selector Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-white">{t('profile.appearance')}</h3>
            <ThemeSelector />
          </div>
          
          <Separator className="my-4" />
          
          {/* Actions Section - Moved to the bottom */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="flex-1 flex items-center gap-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <LogOut size={16} />
                {t('profile.logout')}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex-1 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
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
            
            {/* Save button moved to the bottom */}
            <Button 
              onClick={handleSaveProfile} 
              className="w-full mt-4"
            >
              {t('profile.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
