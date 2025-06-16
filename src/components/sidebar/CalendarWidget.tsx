
import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { safeOpenWindow } from '@/utils/windowUtils';
import { es } from 'date-fns/locale';

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
          locale={es}
          weekStartsOn={1}
          className="rounded-md border-0 w-full text-xs [&_.rdp-cell]:text-center [&_.rdp-button]:mx-auto [&_.rdp-day]:flex [&_.rdp-day]:justify-center [&_.rdp-table]:w-full [&_.rdp-head_th]:text-center [&_.rdp-head_th]:text-xs [&_.rdp-day]:text-xs [&_.rdp-day]:h-7 [&_.rdp-button]:h-6 [&_.rdp-button]:w-6 [&_.rdp-button]:text-xs"
        />
      </div>
    </div>
  );
};

export default CalendarWidget;
