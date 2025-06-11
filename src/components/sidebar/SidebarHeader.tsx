
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfileSection from './UserProfileSection';

interface SidebarHeaderProps {
  username: string;
  avatarUrl: string;
  userId: string | null;
  onClose: () => void;
}

const SidebarHeaderComponent: React.FC<SidebarHeaderProps> = ({ 
  username, 
  avatarUrl, 
  userId, 
  onClose 
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4">
      {/* User profile section on the left */}
      <div className="flex-1">
        <UserProfileSection 
          username={username} 
          avatarUrl={avatarUrl} 
          userId={userId}
          onClose={onClose}
        />
      </div>
      
      {/* Close button on the right */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Cerrar menú"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SidebarHeaderComponent;
