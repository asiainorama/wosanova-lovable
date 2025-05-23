
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

// Import our components
import TimeWidget from './sidebar/TimeWidget';
import WeatherWidget from './sidebar/WeatherWidget';
import CalendarWidget from './sidebar/CalendarWidget';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarFooter from './sidebar/SidebarFooter';
import WidgetIconsRow from './sidebar/WidgetIconsRow';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define profile type based on the actual database structure
interface UserProfile {
  username?: string;
  avatar_url?: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get user session and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          // Try to get user profile data
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('username, avatar_url')
              .eq('id', session.user.id)
              .single();
              
            if (data && !error) {
              // Type assertion to ensure data is treated as UserProfile
              const profileData = data as unknown as UserProfile;
              setUsername(profileData.username || '');
              setAvatarUrl(profileData.avatar_url || '');
              
              // Also update localStorage for immediate use
              localStorage.setItem('username', profileData.username || '');
              localStorage.setItem('avatarUrl', profileData.avatar_url || '');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };
    
    fetchUserData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserData();
      } else {
        setUserId(null);
        setUsername('');
        setAvatarUrl('');
        localStorage.removeItem('username');
        localStorage.removeItem('avatarUrl');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:w-[85%] md:w-[70%] lg:w-[50%] xl:w-[40%] p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white flex flex-col h-full overflow-hidden"
      >
        {/* Header - Fixed height */}
        <div className="flex-shrink-0">
          <SidebarHeader 
            username={username} 
            avatarUrl={avatarUrl} 
            userId={userId} 
            onClose={() => onOpenChange(false)}
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Time Widget - Compact */}
          <div className="px-3 py-2">
            <TimeWidget />
          </div>

          {/* Weather Widget - Compact */}
          <div className="px-3 py-1">
            <WeatherWidget />
          </div>
          
          <Separator className="mx-3 my-2" />
          
          {/* Widget Icons - Responsive */}
          <div className="px-2">
            <WidgetIconsRow />
          </div>

          <Separator className="mx-3 my-2" />
          
          {/* Calendar Widget - Compact */}
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Calendario</h3>
            <div className="w-full">
              <CalendarWidget />
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 mt-auto">
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
