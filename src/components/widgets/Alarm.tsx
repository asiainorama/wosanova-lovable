
import React, { useState, useEffect } from 'react';
import { X, Plus, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AlarmProps {
  onClose?: () => void;
}

interface AlarmItem {
  id: string;
  time: string;
  enabled: boolean;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
}

const Alarm: React.FC<AlarmProps> = ({ onClose }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const { toast } = useToast();
  
  // Load alarms from localStorage on component mount
  useEffect(() => {
    const savedAlarms = localStorage.getItem('userAlarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
  }, []);

  // Save alarms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userAlarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check for alarms that need to trigger
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const currentDay = getDayOfWeek();
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime && alarm.days[currentDay]) {
          // Trigger alarm notification
          const audio = new Audio('/alarm-sound.mp3');
          audio.play().catch(error => console.error('Error playing sound:', error));
          
          toast({
            title: "¡Alarma!",
            description: `Es hora: ${alarm.time}`,
            duration: 10000,
          });
        }
      });
    };
    
    // Check every minute
    const intervalId = setInterval(checkAlarms, 60000);
    
    return () => clearInterval(intervalId);
  }, [alarms, toast]);

  const getDayOfWeek = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayIndex = new Date().getDay();
    return days[dayIndex] as keyof AlarmItem['days'];
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const addAlarm = () => {
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: newAlarmTime,
      enabled: true,
      days: {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false
      }
    };
    
    setAlarms([...alarms, newAlarm]);
    toast({
      title: "Alarma agregada",
      description: `Nueva alarma para las ${newAlarmTime}`,
    });
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
    toast({
      title: "Alarma eliminada",
      variant: "destructive",
    });
  };

  const toggleDay = (alarmId: string, day: keyof AlarmItem['days']) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, days: { ...alarm.days, [day]: !alarm.days[day] } } 
        : alarm
    ));
  };

  return (
    <div className="bg-background flex flex-col h-full w-full rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Alarmas</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center p-4 gap-2 border-b border-gray-200 dark:border-gray-800">
        <Input
          type="time"
          value={newAlarmTime}
          onChange={(e) => setNewAlarmTime(e.target.value)}
          className="flex-1"
        />
        <Button onClick={addAlarm} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto">
        {alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
            <Bell className="h-10 w-10 mb-2 opacity-50" />
            <p>No tienes alarmas configuradas</p>
            <p className="text-sm">Agrega una nueva alarma usando el botón +</p>
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="border rounded-lg p-3 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-medium">{alarm.time}</span>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={alarm.enabled}
                    onCheckedChange={() => toggleAlarm(alarm.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteAlarm(alarm.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-1 text-xs">
                {Object.entries(alarm.days).map(([day, enabled]) => (
                  <Button
                    key={day}
                    variant={enabled ? "default" : "outline"}
                    className="h-6 min-w-6 p-0 text-xs rounded-full"
                    onClick={() => toggleDay(alarm.id, day as keyof AlarmItem['days'])}
                  >
                    {day.charAt(0).toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alarm;
