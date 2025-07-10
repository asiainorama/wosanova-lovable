
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, LogOut, AlertTriangle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeSelector from '@/components/ThemeSelector';
import BackgroundSelector from '@/components/BackgroundSelector';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { username, avatarUrl, userId, updateProfile } = useUserProfile();
  const [localUsername, setLocalUsername] = useState(username);
  const [localAvatarUrl, setLocalAvatarUrl] = useState(avatarUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLocalUsername(username);
    setLocalAvatarUrl(avatarUrl);
  }, [username, avatarUrl]);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      await updateProfile(localUsername, localAvatarUrl);
      toast.success(t('profile.updated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('error.profile'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(t('error.signout'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Delete user favorites
      const { error: favoritesError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId);
      
      if (favoritesError) throw favoritesError;
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success(t('profile.deleted'));
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('error.delete'));
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title={t('profile.title')} />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">{t('auth.login')}</h2>
            <p className="text-gray-600 mb-4">{t('auth.description')}</p>
            <Button onClick={() => navigate('/auth')}>
              {t('auth.login')}
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={t('profile.title')} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            {/* Profile Header with Language Toggle */}
            <div className="text-center mb-6 relative">
              <div className="absolute top-0 right-0">
                <LanguageToggle />
              </div>
              
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarImage src={localAvatarUrl} alt={localUsername} />
                <AvatarFallback className="bg-primary/10">
                  <User size={20} />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold gradient-text">{t('profile.title')}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.description')}</p>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="username" className="text-sm">{t('profile.username')}</Label>
                <Input
                  id="username"
                  value={localUsername}
                  onChange={(e) => setLocalUsername(e.target.value)}
                  placeholder={t('profile.username')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="avatar" className="text-sm">{t('profile.avatar')}</Label>
                <Input
                  id="avatar"
                  value={localAvatarUrl}
                  onChange={(e) => setLocalAvatarUrl(e.target.value)}
                  placeholder={t('profile.avatarUrl')}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading ? t('profile.saving') : t('profile.save')}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Appearance Preferences */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={18} className="text-primary" />
                <h2 className="text-base font-semibold gradient-text">{t('profile.chooseStyle')}</h2>
              </div>
              
              <div className="space-y-4">
                <ThemeSelector />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 dark:text-white">{t('profile.wallpaper')}</h3>
                  <BackgroundSelector />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Actions */}
            <div className="space-y-3">
              {!showDeleteConfirm ? (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="flex-1"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('profile.logout')}
                  </Button>

                  <Button 
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive" 
                    className="flex-1"
                    size="sm"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('profile.delete')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {t('profile.delete.description')}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline" 
                      className="flex-1"
                      size="sm"
                    >
                      {t('profile.cancel')}
                    </Button>
                    <Button 
                      onClick={handleDeleteAccount}
                      variant="destructive" 
                      className="flex-1"
                      size="sm"
                    >
                      {t('profile.delete.confirm')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
