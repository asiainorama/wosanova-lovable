
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
      <div className="flex items-start justify-between w-full">
        {/* Left side: Profile image and username below */}
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <UserProfileSection 
              username={username}
              avatarUrl={avatarUrl}
              userId={userId}
              onClose={onClose}
              avatarOnly={true}
            />
          </div>
          <span className="font-medium dark:text-white truncate text-xs text-center max-w-[80px]">
            {username || t('profile.username')}
          </span>
        </div>
        
        {/* Center: App logo */}
        <div className="flex-1 flex justify-center items-center">
          <img 
            src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
            alt="WosaNova Logo" 
            className="w-10 h-10"
          />
        </div>
        
        {/* Right side: Empty space for balance */}
        <div className="w-[80px]">
          {/* Empty div for layout balance */}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
