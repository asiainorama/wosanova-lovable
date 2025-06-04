
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalculatorButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'equal' | 'function';
  className?: string;
}

const CalculatorButton = ({ children, onClick, variant = 'number', className = '' }: CalculatorButtonProps) => {
  const isMobile = useIsMobile();

  const getButtonStyles = () => {
    const baseStyles = `aspect-square p-0 h-auto ${isMobile ? 'text-3xl' : 'text-2xl'}`;
    
    switch (variant) {
      case 'operator':
        return `${baseStyles} bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50`;
      case 'equal':
        return `col-span-2 bg-orange-500 hover:bg-orange-600 text-white p-0 h-auto aspect-[2/1] ${isMobile ? 'text-2xl' : 'text-xl'}`;
      case 'function':
        return `${baseStyles} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 ${isMobile ? 'text-2xl' : 'text-xl'}`;
      default:
        return baseStyles;
    }
  };

  return (
    <Button 
      variant="outline" 
      className={`${getButtonStyles()} ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default CalculatorButton;
