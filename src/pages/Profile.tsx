
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import AppearanceSettings from '@/components/profile/AppearanceSettings';
import ProfileActions from '@/components/profile/ProfileActions';
import SpaceBackground from '@/components/SpaceBackground';

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
      <div className="min-h-screen flex flex-col relative">
        <SpaceBackground />
        <Header title={t('profile.title')} />
        <main className="flex-1 flex items-center justify-center relative z-10">
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
    <div className="min-h-screen flex flex-col relative">
      <SpaceBackground />
      <Header title={t('profile.title')} />
      
      <main className="container mx-auto px-4 py-6 flex-1 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <ProfileHeader username={localUsername} avatarUrl={localAvatarUrl} />

            <ProfileForm
              username={localUsername}
              avatarUrl={localAvatarUrl}
              onUsernameChange={setLocalUsername}
              onAvatarUrlChange={setLocalAvatarUrl}
              onSave={handleSave}
              isLoading={isLoading}
            />

            <Separator className="my-6" />

            <AppearanceSettings />

            <Separator className="my-6" />

            <ProfileActions
              showDeleteConfirm={showDeleteConfirm}
              onShowDeleteConfirm={setShowDeleteConfirm}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
