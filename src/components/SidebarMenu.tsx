
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Grid3X3, 
  Settings,
  User
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent
} from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { mode, color } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('avatarUrl') || '');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Original menu items with restored names
  const menuItems = [
    { icon: User, label: 'Área Personal', path: '/profile' },
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid3X3, label: 'Catálogo', path: '/catalog' },
    { icon: Settings, label: 'Gestionar Mis Apps', path: '/manage' }
  ];

  // Get user session and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        
        // Try to get user profile data from Supabase
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setUsername(profileData.username || '');
          setAvatarUrl(profileData.avatar_url || '');
          
          // Also update localStorage for immediate use
          localStorage.setItem('username', profileData.username || '');
          localStorage.setItem('avatarUrl', profileData.avatar_url || '');
        }
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
        className="w-64 p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold dark:text-white">Menú</h2>
            
            {/* User profile section at the top of sidebar */}
            {userId && (
              <div className="flex items-center mt-4 mb-2">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium dark:text-white truncate">{username || 'Usuario'}</span>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors dark:text-white dark:hover:bg-gray-800 ${
                      location.pathname === item.path 
                        ? 'bg-gray-100 font-medium dark:bg-gray-800 text-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onOpenChange(false)}
                  >
                    <item.icon size={18} className={location.pathname === item.path ? 'text-primary' : ''} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
