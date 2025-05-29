
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
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center justify-center w-full">
        {/* Centered profile image */}
        <div className="mb-3">
          <UserProfileSection 
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            onClose={onClose}
            avatarOnly={true}
          />
        </div>
        
        {/* Centered username below the profile image */}
        <span className="font-medium dark:text-white text-center text-sm">
          {username || t('profile.username')}
        </span>
      </div>
    </div>
  );
};

export default SidebarHeader;
