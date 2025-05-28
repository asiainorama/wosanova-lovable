
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
    <div className="p-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1 text-start">
          <img 
            src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
            alt="WosaNova Logo" 
            className="w-8 h-8"
          />
        </div>
        
        <div className="flex-shrink-0 mx-3">
          <UserProfileSection 
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            onClose={onClose}
            avatarOnly={true}
          />
        </div>
        
        <div className="flex-1 text-end">
          <span className="font-medium dark:text-white truncate text-sm inline-block max-w-full">
            {username || t('profile.username')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
