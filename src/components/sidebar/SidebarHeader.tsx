
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
      <div className="flex items-center gap-3 w-full">
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
        
        {/* Username in the center */}
        <div className="flex-1 flex justify-center">
          <span className="font-medium dark:text-white text-center text-sm">
            {username || t('profile.username')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
