
import React, { useEffect, useState } from 'react';
import { CloudSun } from 'lucide-react';
import { safeOpenWindow } from '@/utils/windowUtils';

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
      <div className="p-2 bg-blue-50/30 rounded-lg flex items-center justify-center h-16 dark:bg-gray-800">
        <span className="text-sm">Cargando clima...</span>
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
