
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SidebarHeader from '@/components/sidebar/SidebarHeader';
import SidebarFooter from '@/components/sidebar/SidebarFooter';
import UserProfileSection from '@/components/sidebar/UserProfileSection';
import TimeWidget from '@/components/sidebar/TimeWidget';
import WeatherWidget from '@/components/sidebar/WeatherWidget';
import WidgetIconsRow from '@/components/sidebar/WidgetIconsRow';
import CalendarWidget from '@/components/sidebar/CalendarWidget';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
  avatarUrl?: string;
  userId?: string | null;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  isOpen, 
  onOpenChange, 
  username = '', 
  avatarUrl = '', 
  userId = null 
}) => {
  const isMobile = useIsMobile();

  const handleWidgetOpen = () => {
    // Close sidebar when a widget is opened on mobile
    if (isMobile) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <div /> {/* Empty trigger since we control open state externally */}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col h-full">
        <SidebarHeader 
          username={username}
          avatarUrl={avatarUrl}
          userId={userId}
          onClose={handleClose}
        />
        
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* Top section with Time and Weather */}
          <div className="space-y-3">
            <TimeWidget onWidgetOpen={handleWidgetOpen} />
            <WeatherWidget />
          </div>

          {/* Center section with Widget Icons */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full">
              <WidgetIconsRow onWidgetOpen={handleWidgetOpen} />
            </div>
          </div>

          {/* Bottom section with Calendar (above footer) */}
          <div className="mt-auto">
            <CalendarWidget />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800">
          <UserProfileSection 
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            onClose={handleClose}
          />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
