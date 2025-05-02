
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Grid3X3, 
  Settings,
  User,
  Calendar,
  Clock,
  CloudSun,
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent
} from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';

interface SidebarMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define profile type based on the actual database structure
interface UserProfile {
  username?: string;
  avatar_url?: string;
}

// Widget para mostrar la hora y fecha actual
const TimeWidget = () => {
  const [date, setDate] = useState(new Date());
  const { t } = useLanguage();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  return (
    <div className="p-3 bg-primary/10 rounded-lg flex flex-col items-center dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={18} className="text-primary" />
        <span className="text-lg font-medium">{formattedTime}</span>
      </div>
      <div className="text-sm text-muted-foreground capitalize">
        {dayOfWeek}, {formattedDate}
      </div>
    </div>
  );
};

// Widget para mostrar el clima
const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: null, condition: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        // Obtener la ubicación actual
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Llamada a la API de OpenWeatherMap (para una implementación real necesitarías una API key)
          // Simulando datos para el ejemplo
          setTimeout(() => {
            setWeather({ 
              temp: Math.round(15 + Math.random() * 10), 
              condition: 'Parcialmente nublado'
            });
            setLoading(false);
          }, 1000);
        }, 
        () => {
          setError('No se pudo obtener la ubicación');
          setLoading(false);
        });
      } catch (err) {
        setError('Error al obtener el clima');
        setLoading(false);
      }
    };
    
    getWeather();
  }, []);
  
  if (loading) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
        <span className="text-sm">Cargando clima...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="p-3 bg-blue-50 rounded-lg flex flex-col items-center dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-1">
        <CloudSun size={18} className="text-blue-500" />
        <span className="text-lg font-medium">{weather.temp}°C</span>
      </div>
      <span className="text-sm text-muted-foreground">{weather.condition}</span>
    </div>
  );
};

// Widget para el calendario
const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <CalendarComponent
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  );
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { mode, color } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('avatarUrl') || '');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Menu items using translation keys
  const menuItems = [
    { icon: Home, label: t('header.home'), path: '/' },
    { icon: Grid3X3, label: t('header.catalog'), path: '/catalog' },
    { icon: Settings, label: t('header.manage'), path: '/manage' },
    { icon: User, label: t('profile.title'), path: '/profile' }
  ];

  // Get user session and profile data
  useEffect(() => {
    const fetchUserData = async () => {
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
        className="w-full sm:w-[20%] p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold dark:text-white theme-text">{t('app.name')}</h2>
            
            {/* User profile section at the top of sidebar - now clickable */}
            {userId && (
              <Link to="/profile" onClick={() => onOpenChange(false)} className="flex items-center mt-4 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium dark:text-white truncate theme-text">{username || t('profile.username')}</span>
              </Link>
            )}
          </div>

          <div className="px-4 py-2">
            <TimeWidget />
          </div>

          <div className="px-4 py-2">
            <WeatherWidget />
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
                    <span className="theme-text">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <Separator className="my-2" />
          
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium mb-2 dark:text-gray-300">Calendario</h3>
            <CalendarWidget />
          </div>

          <div className="p-4 text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} AppGarden
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
