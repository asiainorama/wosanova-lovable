
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimeWidget = () => {
  const [date, setDate] = useState(new Date());
  
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
  const formattedDate = `${dayOfWeek}, ${day} de ${month} del ${year}`;
  
  const formattedTime = date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <div className="p-3 bg-primary/10 rounded-lg flex flex-col items-center dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={18} className="text-primary" />
        <span className="text-lg font-medium">{formattedTime}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {formattedDate}
      </div>
    </div>
  );
};

export default TimeWidget;
