
import React from 'react';
import SidebarHeaderComponent from './sidebar/SidebarHeader';
import SidebarFooterComponent from './sidebar/SidebarFooter';
import SidebarContent from './sidebar/SidebarContent';
import { SidebarOverlay } from './sidebar/SidebarOverlay';
import { SidebarSection } from './sidebar/SidebarSection';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSidebarLayout } from '@/hooks/useSidebarLayout';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const { username, avatarUrl, userId } = useUserProfile();
  const { getSidebarClasses, getOverlayClasses, getSectionClasses } = useSidebarLayout();

  const handleClose = () => onOpenChange(false);

  return (
    <>
      <SidebarOverlay 
        isOpen={isOpen}
        onClose={handleClose}
        className={getOverlayClasses()}
      />
      
      <div className={getSidebarClasses(isOpen)}>
        <SidebarSection className={getSectionClasses('header')}>
          <SidebarHeaderComponent 
            username={username} 
            avatarUrl={avatarUrl} 
            userId={userId} 
            onClose={handleClose}
          />
        </SidebarSection>

        <SidebarContent />

        <SidebarSection className={getSectionClasses('footer')}>
          <SidebarFooterComponent onClose={handleClose} />
        </SidebarSection>
      </div>
    </>
  );
};

export default SidebarMenu;
