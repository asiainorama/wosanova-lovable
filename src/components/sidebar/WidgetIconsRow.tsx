
import React from 'react';
import { Calculator, ArrowUpDown, FileText, AlarmClock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { safeOpenWindow } from '@/utils/windowUtils';
import { Button } from '@/components/ui/button';

interface WidgetProps {
  icon: React.ReactNode;
  name: string;
  url: string;
}

const WidgetButton: React.FC<WidgetProps> = ({ icon, name, url }) => {
  const handleClick = () => {
    safeOpenWindow(url);
  };
  
  return (
    <Button 
      onClick={handleClick}
      variant="ghost" 
      size="icon"
      className="rounded-full h-12 w-12 flex items-center justify-center bg-primary/10 hover:bg-primary/20 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      {icon}
      <span className="sr-only">{name}</span>
    </Button>
  );
};

const WidgetIconsRow: React.FC = () => {
  const isMobile = useIsMobile();
  
  const widgets = [
    { 
      name: 'Calculadora', 
      icon: <Calculator size={24} className="text-primary" />, 
      url: '/widgets/calculator'
    },
    { 
      name: 'Conversor', 
      icon: <ArrowUpDown size={24} className="text-primary" />, 
      url: '/widgets/converter' 
    },
    { 
      name: 'Notas', 
      icon: <FileText size={24} className="text-primary" />, 
      url: '/widgets/notes'
    },
    { 
      name: 'Alarmas', 
      icon: <AlarmClock size={24} className="text-primary" />, 
      url: '/widgets/alarm'
    }
  ];

  return (
    <div className="flex justify-around items-center p-4 gap-2">
      {widgets.map((widget) => (
        <WidgetButton 
          key={widget.name}
          icon={widget.icon}
          name={widget.name}
          url={widget.url}
        />
      ))}
    </div>
  );
};

export default WidgetIconsRow;
