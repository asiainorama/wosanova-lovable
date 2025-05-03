
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { safeOpenWindow } from '@/utils/windowUtils';

const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      safeOpenWindow('https://calendar.google.com/');
    }
  };
  
  const handleMonthChange = (month: Date) => {
    // Just update the view without opening Google Calendar
    setDate(prevDate => {
      if (!prevDate) return month;
      
      const newDate = new Date(prevDate);
      newDate.setMonth(month.getMonth());
      newDate.setFullYear(month.getFullYear());
      return newDate;
    });
  };
  
  return (
    <div className="flex justify-center w-full">
      <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 w-full overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          className="rounded-md border w-full [&_.rdp-cell]:text-center [&_.rdp-button]:mx-auto [&_.rdp-day]:flex [&_.rdp-day]:justify-center [&_.rdp-table]:w-full [&_.rdp-head_th]:text-center"
        />
      </div>
    </div>
  );
};

export default CalendarWidget;
