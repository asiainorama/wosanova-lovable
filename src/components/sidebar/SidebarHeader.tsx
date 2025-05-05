
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
      <div className="flex flex-row items-center justify-between px-2">
        <h2 className="text-xl font-bold gradient-text">
          {t('app.name')}
        </h2>
        
        <UserProfileSection 
          username={username}
          avatarUrl={avatarUrl}
          userId={userId}
          onClose={onClose}
          compact={true}
        />
      </div>
    </div>
  );
};

export default SidebarHeader;
