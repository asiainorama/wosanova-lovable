
import React from 'react';
import { SheetContent } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Separator } from '@/components/ui/separator';
import { useSidebarUser } from '@/hooks/useSidebarUser';

// Import refactored widget components
import TimeWidget from '@/components/widgets/TimeWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import SidebarUserProfile from '@/components/sidebar/SidebarUserProfile';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const { mode, color } = useTheme();
  const { t } = useLanguage();
  const { userId, username, avatarUrl } = useSidebarUser();
  
  return (
    <SheetContent
      side="left"
      className="w-full sm:w-[40%] p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white overflow-y-auto"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <h2 className="text-xl font-bold dark:text-white theme-text text-center">{t('app.name')}</h2>
          
          {/* User profile section at the top of sidebar - centered */}
          <SidebarUserProfile 
            userId={userId} 
            username={username} 
            avatarUrl={avatarUrl} 
            onSidebarClose={() => onOpenChange(false)} 
          />
        </div>

        <div className="px-4 py-2">
          <TimeWidget />
        </div>

        <div className="px-4 py-2">
          <WeatherWidget />
        </div>

        <Separator className="my-2" />
        
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Calendario</h3>
          <CalendarWidget />
        </div>

        <div className="p-4 text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} WosaNova
        </div>
      </div>
    </SheetContent>
  );
};

export default SidebarMenu;
