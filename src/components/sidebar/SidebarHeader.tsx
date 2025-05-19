
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
      <div className="flex items-center justify-between px-2 w-full">
        <div className="w-1/3 text-start">
          <h2 className="text-xl font-bold gradient-text truncate">
            {t('app.name')}
          </h2>
        </div>
        
        <div className="w-1/3 flex justify-center">
          <UserProfileSection 
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            onClose={onClose}
            avatarOnly={true}
          />
        </div>
        
        <div className="w-1/3 text-end">
          <span className="font-medium dark:text-white truncate text-sm inline-block max-w-full">
            {username || t('profile.username')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
