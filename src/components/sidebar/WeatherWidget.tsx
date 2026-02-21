
import React, { useEffect, useState } from 'react';
import { CloudSun } from 'lucide-react';
import { safeOpenWindow } from '@/utils/windowUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Widget para mostrar el clima con API real
const WeatherWidget = () => {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState({ temp: null, condition: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
            body: { latitude, longitude, language }
          });
          
          if (fnError || !data) {
            throw new Error('Error al obtener datos del clima');
          }
          
          setWeather({ 
            temp: data.temp, 
            condition: data.condition
          });
          setLoading(false);
        }, 
        (err) => {
          console.error('Error de geolocalización:', err);
          setError(t('weather.locationError'));
          setLoading(false);
        });
      } catch (err) {
        console.error('Error al obtener el clima:', err);
        setError(t('weather.error'));
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
      <div className="p-2 bg-blue-50/30 rounded-lg flex items-center justify-center h-16 dark:bg-gray-800">
        <span className="text-sm">{t('weather.loading')}</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-2 bg-blue-50/30 rounded-lg flex items-center justify-center h-16 dark:bg-gray-800">
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="p-2 bg-blue-50/30 rounded-lg flex items-center h-16 dark:bg-gray-800 cursor-pointer"
         onClick={handleWeatherClick}>
      <div className="flex-1 flex items-center justify-center pr-2 border-r border-blue-200 dark:border-gray-600">
        <span className="text-2xl font-bold text-blue-500">{weather.temp}°</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pl-2">
        <CloudSun size={20} className="text-blue-500 mb-1" />
        <span className="text-xs text-muted-foreground line-clamp-1">{weather.condition}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
