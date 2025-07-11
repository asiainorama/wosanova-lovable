
import React from 'react';
import { Calculator, ArrowUpDown, FileText, AlarmClock } from 'lucide-react';
import { useFloatingWidgets } from '@/contexts/FloatingWidgetsContext';
import { Button } from '@/components/ui/button';

interface WidgetProps {
  icon: React.ReactNode;
  name: string;
  type: 'calculator' | 'converter' | 'notes' | 'alarm';
}

const WidgetButton: React.FC<WidgetProps> = ({ icon, name, type }) => {
  const { openWidget } = useFloatingWidgets();
  
  const handleClick = () => {
    openWidget(type);
    // Remove the automatic sidebar close - let user control it manually
  };
  
  return (
    <Button 
      onClick={handleClick}
      variant="ghost" 
      size="icon"
      className="rounded-full h-12 w-12 flex items-center justify-center bg-primary/10 hover:bg-primary/20 dark:bg-gray-800 dark:hover:bg-gray-700 flex-1"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      <span className="sr-only">{name}</span>
    </Button>
  );
};

const WidgetIconsRow: React.FC = () => {
  const widgets = [
    { 
      name: 'Calculadora', 
      icon: <Calculator className="text-primary" />, 
      type: 'calculator' as const
    },
    { 
      name: 'Conversor', 
      icon: <ArrowUpDown className="text-primary" />, 
      type: 'converter' as const
    },
    { 
      name: 'Notas', 
      icon: <FileText className="text-primary" />, 
      type: 'notes' as const
    },
    { 
      name: 'Alarmas', 
      icon: <AlarmClock className="text-primary" />, 
      type: 'alarm' as const
    }
  ];

  return (
    <div className="flex justify-between items-center px-3 py-4 gap-4 w-full">
      {widgets.map((widget) => (
        <WidgetButton 
          key={widget.name}
          icon={widget.icon}
          name={widget.name}
          type={widget.type}
        />
      ))}
    </div>
  );
};

export default WidgetIconsRow;
