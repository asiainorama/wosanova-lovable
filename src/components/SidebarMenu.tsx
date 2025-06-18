
import React from 'react';
import SidebarHeaderComponent from './sidebar/SidebarHeader';
import SidebarFooterComponent from './sidebar/SidebarFooter';
import SidebarContent from './sidebar/SidebarContent';
import { useUserProfile } from '@/hooks/useUserProfile';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const { username, avatarUrl, userId } = useUserProfile();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-full md:w-[400px] flex flex-col backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 
                     shadow-2xl shadow-black/10 dark:shadow-black/30
                     border-white/10 dark:border-gray-800/20 border-r z-[101]
                     transition-transform duration-300 ease-in-out ${
                       isOpen ? 'translate-x-0' : '-translate-x-full'
                     }`}>
        {/* Header - Fixed height exactly matching main app header */}
        <div className="h-[60px] flex items-center backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border-b border-white/10 dark:border-gray-700/20">
          <SidebarHeaderComponent 
            username={username} 
            avatarUrl={avatarUrl} 
            userId={userId} 
            onClose={() => onOpenChange(false)}
          />
        </div>

        {/* Content area - Using flexbox for better distribution */}
        <SidebarContent />

        {/* Footer - Fixed height exactly matching header */}
        <div className="h-[60px] flex items-center backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border-t border-white/10 dark:border-gray-700/20">
          <SidebarFooterComponent onClose={() => onOpenChange(false)} />
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
