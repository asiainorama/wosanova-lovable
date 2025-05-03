
import React, { useState, useEffect } from 'react';
import { CloudSun } from 'lucide-react';
import { safeOpenWindow } from '@/utils/windowUtils';

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
    <div className="p-3 bg-blue-50 rounded-lg flex flex-col items-center dark:bg-gray-800 cursor-pointer"
         onClick={handleWeatherClick}>
      <div className="flex items-center gap-2 mb-1">
        <CloudSun size={18} className="text-blue-500" />
        <span className="text-lg font-medium">{weather.temp}°C</span>
      </div>
      <span className="text-sm text-muted-foreground">{weather.condition}</span>
    </div>
  );
};

export default WeatherWidget;
