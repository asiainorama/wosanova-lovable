
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import UserProfileSection from './UserProfileSection';

interface SidebarHeaderProps {
  username: string;
  avatarUrl: string;
  userId: string | null;
  onClose: () => void;
}

const SidebarHeader = ({ username, avatarUrl, userId, onClose }: SidebarHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center w-full px-4">
      {/* Profile image on the left */}
      <div className="flex-shrink-0">
        <UserProfileSection 
          username={username}
          avatarUrl={avatarUrl}
          userId={userId}
          onClose={onClose}
          avatarOnly={true}
        />
      </div>
      
      {/* Username perfectly centered */}
      <div className="flex-1 flex justify-center">
        <span className="font-medium dark:text-white text-center text-sm">
          {username || t('profile.username')}
        </span>
      </div>
      
      {/* Invisible spacer to balance the layout */}
      <div className="flex-shrink-0 w-10"></div>
    </div>
  );
};

export default SidebarHeader;
