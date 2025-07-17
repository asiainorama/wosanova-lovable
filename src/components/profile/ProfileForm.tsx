
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface ProfileFormProps {
  username: string;
  avatarUrl: string;
  onUsernameChange: (value: string) => void;
  onAvatarUrlChange: (value: string) => void;
  onSave: () => void;
  isLoading: boolean;
}

const ProfileForm = ({
  username,
  avatarUrl,
  onUsernameChange,
  onAvatarUrlChange,
  onSave,
  isLoading
}: ProfileFormProps) => {
  const { t } = useLanguage();
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const checkIfGoogleUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has Google metadata
        const hasGoogleData = session.user.user_metadata?.full_name || 
                            session.user.user_metadata?.name || 
                            session.user.user_metadata?.avatar_url || 
                            session.user.user_metadata?.picture;
        setIsGoogleUser(!!hasGoogleData);
      }
    };

    checkIfGoogleUser();
  }, []);

  // If it's a Google user, don't show the form fields
  if (isGoogleUser) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username" className="text-sm">{t('profile.username')}</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder={t('profile.username')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="avatar" className="text-sm">{t('profile.avatar')}</Label>
        <Input
          id="avatar"
          value={avatarUrl}
          onChange={(e) => onAvatarUrlChange(e.target.value)}
          placeholder={t('profile.avatarUrl')}
          className="mt-1"
        />
      </div>

      <Button 
        onClick={onSave} 
        disabled={isLoading}
        className="w-full"
        size="sm"
      >
        {isLoading ? t('profile.saving') : t('profile.save')}
      </Button>
    </div>
  );
};

export default ProfileForm;
