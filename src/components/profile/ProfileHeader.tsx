
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string;
}

const ProfileHeader = ({ username, avatarUrl }: ProfileHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-6 relative">
      <div className="absolute top-0 right-0">
        <LanguageToggle />
      </div>
      
      <Avatar className="h-16 w-16 mx-auto mb-3">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback className="bg-primary/10">
          <User size={20} />
        </AvatarFallback>
      </Avatar>
      <h1 className="text-xl font-bold gradient-text">{t('profile.title')}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.description')}</p>
    </div>
  );
};

export default ProfileHeader;
