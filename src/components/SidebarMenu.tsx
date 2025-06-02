import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          // Check if user is admin
          if (session.user.email) {
            const isAdminUser = session.user.email.endsWith("@wosanova.com") || 
                              session.user.email === "asiainorama@gmail.com";
            setIsAdmin(isAdminUser);
          }
          
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
        setIsAdmin(false);
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
        className="w-full sm:w-[85%] md:w-[70%] lg:w-[50%] xl:w-[40%] p-0 border-r-0 flex flex-col h-full overflow-hidden
                   backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 
                   shadow-2xl shadow-black/10 dark:shadow-black/30
                   border-white/10 dark:border-gray-800/20"
      >
        {/* Header - Fixed height exactly matching main app header */}
        <div className="flex-shrink-0 h-[60px] flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border-b border-white/10 dark:border-gray-700/20">
          <SidebarHeader 
            username={username} 
            avatarUrl={avatarUrl} 
            userId={userId} 
            onClose={() => onOpenChange(false)}
          />
        </div>

        {/* Content area - Using flexbox for better distribution */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden">
          
          {/* Top section with Time and Weather - takes natural space */}
          <div className="flex-shrink-0 space-y-2 px-3 py-2">
            <TimeWidget />
            <WeatherWidget />
          </div>

          {/* Center section with Widget Icons - centered in available space */}
          <div className="flex-1 flex items-center justify-center px-2">
            <WidgetIconsRow />
          </div>
          
          {/* Bottom section with Calendar - takes natural space at bottom */}
          <div className="flex-shrink-0 px-3 pb-2">
            <h3 className="text-xs font-medium mb-2 dark:text-gray-300">Calendario</h3>
            <div className="w-full">
              <CalendarWidget />
            </div>
          </div>
        </div>

        {/* Footer - Fixed height exactly matching header */}
        <div className="flex-shrink-0 h-[60px] flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border-t border-white/10 dark:border-gray-700/20">
          <SidebarFooter isAdmin={isAdmin} onClose={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
