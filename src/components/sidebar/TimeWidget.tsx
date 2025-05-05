
import React, { useEffect, useState } from 'react';
import { Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safeOpenWindow } from '@/utils/windowUtils';
import { useIsMobile } from '@/hooks/use-mobile';

// Widget para mostrar la hora y fecha actual
const TimeWidget = () => {
  const [date, setDate] = useState(new Date());
  const isMobile = useIsMobile();
  
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

  const handleOpenAlarmWidget = () => {
    const baseUrl = isMobile ? '/' : '';
    safeOpenWindow(`${baseUrl}/widgets/alarm`);
  };
  
  return (
    <Button 
      variant="ghost" 
      className="p-3 bg-primary/10 rounded-lg flex items-center dark:bg-gray-800 h-20 w-full hover:bg-primary/20 dark:hover:bg-gray-700"
      onClick={handleOpenAlarmWidget}
    >
      <div className="flex-1 flex items-center justify-center pr-2 border-r border-primary/20 dark:border-gray-600">
        <span className="text-3xl font-bold text-primary">{hours}:{minutes}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pl-2">
        <span className="text-sm font-medium">{dayOfWeek}</span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      <Bell size={18} className="ml-2 text-primary/60" />
    </Button>
  );
};

export default TimeWidget;
