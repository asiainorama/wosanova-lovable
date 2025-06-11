
import React, { useEffect, useState } from 'react';
import { Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFloatingWidgets } from '@/contexts/FloatingWidgetsContext';

// Widget para mostrar la hora y fecha actual
const TimeWidget: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const { openWidget } = useFloatingWidgets();
  
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
    openWidget('alarm');
    // Remove the automatic sidebar close - let user control it manually
  };
  
  return (
    <Button 
      variant="ghost" 
      className="p-2 bg-primary/10 rounded-lg flex items-center dark:bg-gray-800 h-16 w-full hover:bg-primary/20 dark:hover:bg-gray-700"
      onClick={handleOpenAlarmWidget}
    >
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="text-2xl font-bold text-primary">{hours}:{minutes}</span>
        <Bell size={16} className="text-primary/60" onClick={handleOpenAlarmWidget} />
      </div>
      <div className="w-[1px] h-[70%] bg-primary/20 dark:bg-gray-600 mx-2" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="text-xs font-medium">{dayOfWeek}</span>
        <span className="text-xs text-muted-foreground truncate">{formattedDate}</span>
      </div>
    </Button>
  );
};

export default TimeWidget;
