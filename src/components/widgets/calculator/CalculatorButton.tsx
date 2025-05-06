
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalculatorButtonProps {
  value: string;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'equals' | 'function';
  className?: string;
}

const CalculatorButton = ({ value, onClick, variant = 'default', className }: CalculatorButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'operator':
        return "bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50";
      case 'equals':
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case 'function':
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700";
      default:
        return "";
    }
  };

  return (
    <Button 
      variant="outline" 
      className={cn(
        "aspect-square text-xl p-0 h-auto",
        getButtonStyle(),
        className
      )}
      onClick={onClick}
    >
      {value}
    </Button>
  );
};

export default CalculatorButton;
