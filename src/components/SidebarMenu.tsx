
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
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
import { safeOpenWindow } from '@/utils/windowUtils';

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
  
  // Format day of week with first letter capitalized and the rest lowercase
  const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'long' }).charAt(0).toUpperCase() + 
                   date.toLocaleDateString('es-ES', { weekday: 'long' }).slice(1);
                   
  // Format day with leading zero
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format month and year
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  
  // Final formatted date: "Viernes, 02 de mayo del 2025"
  const formattedDate = `${day} de ${month} del ${year}`;
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return (
    <div className="p-3 bg-primary/10 rounded-lg flex items-center dark:bg-gray-800 h-20">
      <div className="flex-1 flex items-center justify-center pr-2 border-r border-primary/20 dark:border-gray-600">
        <span className="text-3xl font-bold text-primary">{hours}:{minutes}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pl-2">
        <span className="text-sm font-medium">{dayOfWeek}</span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
    </div>
  );
};

// Widget para mostrar el clima con API real
const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: null, condition: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_KEY = 'ce46da3d0d80c45822b28b8f001e838f';

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        // Obtener la ubicación actual
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Llamada a la API de OpenWeatherMap
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`);
          
          if (!response.ok) {
            throw new Error('Error al obtener datos del clima');
          }
          
          const data = await response.json();
          setWeather({ 
            temp: Math.round(data.main.temp), 
            condition: data.weather[0].description
          });
          setLoading(false);
        }, 
        (err) => {
          console.error('Error de geolocalización:', err);
          setError('No se pudo obtener la ubicación');
          setLoading(false);
        });
      } catch (err) {
        console.error('Error al obtener el clima:', err);
        setError('Error al obtener el clima');
        setLoading(false);
      }
    };
    
    getWeather();
  }, []);
  
  const handleWeatherClick = () => {
    safeOpenWindow('https://www.google.com/search?q=weather');
  };
  
  if (loading) {
    return (
      <div className="p-3 bg-blue-50/30 rounded-lg flex items-center justify-center h-20 dark:bg-gray-800">
        <span className="text-sm">Cargando clima...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 bg-blue-50/30 rounded-lg flex items-center justify-center h-20 dark:bg-gray-800">
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="p-3 bg-blue-50/30 rounded-lg flex items-center h-20 dark:bg-gray-800 cursor-pointer"
         onClick={handleWeatherClick}>
      <div className="flex-1 flex items-center justify-center pr-2 border-r border-blue-200 dark:border-gray-600">
        <span className="text-3xl font-bold text-blue-500">{weather.temp}°</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pl-2">
        <CloudSun size={24} className="text-blue-500 mb-1" />
        <span className="text-xs text-muted-foreground line-clamp-1">{weather.condition}</span>
      </div>
    </div>
  );
};

// Widget para el calendario
const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      safeOpenWindow('https://calendar.google.com/');
    }
  };
  
  return (
    <div className="flex justify-center w-full">
      <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 w-full overflow-hidden">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border w-full [&_.rdp-cell]:text-center [&_.rdp-button]:mx-auto [&_.rdp-day]:flex [&_.rdp-day]:justify-center [&_.rdp-table]:w-full [&_.rdp-head_th]:text-center"
        />
      </div>
    </div>
  );
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { mode } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
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
        className="w-full sm:w-[40%] p-0 bg-background border-r-0 dark:bg-gray-900 dark:text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <h2 className="text-xl font-bold dark:text-white bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">{t('app.name')}</h2>
            
            {/* User profile section at the top of sidebar - centered */}
            {userId && (
              <div className="flex flex-col items-center mt-4 mb-2">
                <Link to="/profile" onClick={() => onOpenChange(false)}>
                  <Avatar className="h-12 w-12 mb-2">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback className="bg-primary/10">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <span className="font-medium dark:text-white truncate theme-text">
                  {username || t('profile.username')}
                </span>
              </div>
            )}
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
    </Sheet>
  );
};

export default SidebarMenu;
