
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Bell, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>('default');
  const [isCheckingAlarms, setIsCheckingAlarms] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();
  
  // Request notification permissions on component mount
  useEffect(() => {
    checkNotificationPermission();
    
    const savedAlarms = localStorage.getItem('userAlarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
    
    // Create audio element for alarm sound with fallback
    const audio = new Audio();
    
    // Try to use the alarm sound file, with fallback to a beep
    audio.src = '/alarm-sound.mp3';
    audio.loop = true;
    audio.volume = 0.7;
    
    // Handle errors by creating a synthetic beep
    audio.onerror = () => {
      console.log('Alarm sound file not found, using synthetic sound');
    };
    
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationsPermission(permission);
      
      if (permission === 'default') {
        // Show toast asking for permission
        setTimeout(() => {
          toast({
            title: "Permisos de notificación",
            description: "Permite las notificaciones para recibir alertas de alarma",
            duration: 5000,
          });
        }, 1000);
      }
    } else {
      console.log('Este navegador no soporta notificaciones');
      toast({
        title: "Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationsPermission(permission);
        
        if (permission === 'granted') {
          toast({
            title: "Permisos concedidos",
            description: "Ahora recibirás notificaciones de alarma",
          });
        } else {
          toast({
            title: "Permisos denegados",
            description: "No podrás recibir notificaciones de alarma",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast({
          title: "Error",
          description: "No se pudieron solicitar los permisos",
          variant: "destructive",
        });
      }
    }
  };

  // Save alarms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userAlarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check for alarms that need to trigger every minute
  useEffect(() => {
    if (alarms.length === 0) return;
    
    const checkAlarms = () => {
      setIsCheckingAlarms(true);
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const currentDay = getDayOfWeek();
      
      console.log(`Checking alarms at ${currentTime} on ${currentDay}`);
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime && alarm.days[currentDay]) {
          console.log(`Alarm triggered: ${alarm.time}`);
          triggerAlarm(alarm);
        }
      });
      setIsCheckingAlarms(false);
    };
    
    // Check immediately
    checkAlarms();
    
    // Then check every 30 seconds
    const intervalId = setInterval(checkAlarms, 30000);
    
    return () => clearInterval(intervalId);
  }, [alarms]);

  const getDayOfWeek = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayIndex = new Date().getDay();
    return days[dayIndex] as keyof AlarmItem['days'];
  };
  
  const playAlarmSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Error playing alarm sound:', error);
        // Fallback: create synthetic beep
        createSyntheticBeep();
      });
    } else {
      createSyntheticBeep();
    }
  };

  const createSyntheticBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      // Repeat beep 3 times
      setTimeout(() => createSyntheticBeep(), 1200);
    } catch (error) {
      console.log('Cannot create synthetic beep:', error);
    }
  };

  const triggerAlarm = (alarm: AlarmItem) => {
    console.log('Triggering alarm:', alarm);
    
    // Play alarm sound
    playAlarmSound();
    
    // Show browser notification
    if (notificationsPermission === 'granted') {
      try {
        const notification = new Notification('🔔 ¡Alarma!', {
          body: `Es hora: ${alarm.time}`,
          icon: '/icons/icon-192x192.png',
          requireInteraction: true,
          tag: `alarm-${alarm.id}`,
          silent: false,
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          stopAlarm();
        };
        
        // Auto close notification after 30 seconds
        setTimeout(() => {
          notification.close();
        }, 30000);
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
      // Request permission if not granted
      if (notificationsPermission === 'default') {
        requestNotificationPermission();
      }
    }
    
    // Show toast notification
    toast({
      title: "🔔 ¡Alarma!",
      description: `Es hora: ${alarm.time}`,
      duration: 15000,
    });
    
    // Also show a sonner toast for redundancy
    sonnerToast("🔔 ¡Alarma activada!", {
      description: `Es hora: ${alarm.time}`,
      duration: 20000,
      action: {
        label: "Detener",
        onClick: stopAlarm
      }
    });
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Dismiss all notifications with our tag
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag: 'alarm' }).then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }
  };

  const handleClose = () => {
    stopAlarm();
    
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

  const testAlarm = () => {
    const testAlarmData: AlarmItem = {
      id: 'test',
      time: 'test',
      enabled: true,
      days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true }
    };
    
    triggerAlarm(testAlarmData);
    
    // Stop the test alarm after 3 seconds
    setTimeout(stopAlarm, 3000);
  };

  const dayLabels = {
    mon: 'L',
    tue: 'M',
    wed: 'X',
    thu: 'J',
    fri: 'V',
    sat: 'S',
    sun: 'D'
  };

  return (
    <div className={`bg-background flex flex-col rounded-lg ${isMobile ? 'h-screen w-screen' : 'h-full w-full'}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Alarmas</h2>
        <div className="flex items-center gap-2">
          {isCheckingAlarms && (
            <Bell className="h-4 w-4 animate-pulse text-green-500" />
          )}
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Notification permission banner */}
      {notificationsPermission !== 'granted' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Activa las notificaciones para recibir alertas de alarma
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={requestNotificationPermission}
              className="ml-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-900/40"
            >
              Activar
            </Button>
          </div>
        </div>
      )}
      
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
        <Button onClick={testAlarm} variant="outline" size="sm" className="gap-1">
          <Volume2 className="h-4 w-4" />
          Probar
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
                    {dayLabels[day as keyof typeof dayLabels]}
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
