
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCalculator } from './calculator/useCalculator';
import CalculatorDisplay from './calculator/CalculatorDisplay';
import CalculatorGrid from './calculator/CalculatorGrid';

interface CalculatorProps {
  onClose?: () => void;
}

const Calculator = ({ onClose }: CalculatorProps) => {
  const isMobile = useIsMobile();
  const {
    input,
    prevValue,
    operator,
    clearAll,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEqual,
    handlePercentage,
    handlePlusMinus
  } = useCalculator();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`bg-background flex flex-col rounded-lg ${isMobile ? 'h-screen w-screen' : 'h-full w-full'}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800" data-widget-header>
        <h2 className="text-xl font-bold">Calculadora</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className={`p-3 flex-1 flex flex-col ${isMobile ? 'min-h-0' : ''}`}>
        <CalculatorDisplay 
          input={input}
          prevValue={prevValue}
          operator={operator}
        />
        
        <CalculatorGrid
          onClearAll={clearAll}
          onPlusMinus={handlePlusMinus}
          onPercentage={handlePercentage}
          onOperator={handleOperator}
          onDigit={handleDigit}
          onDecimal={handleDecimal}
          onEqual={handleEqual}
        />
      </div>
    </div>
  );
};

export default Calculator;
