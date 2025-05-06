
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalculatorDisplay from './calculator/CalculatorDisplay';
import CalculatorKeypad from './calculator/CalculatorKeypad';
import { 
  handleDigitPress, 
  handleDecimalPress, 
  handleOperatorPress, 
  handleEqualPress, 
  handleClearAll, 
  handlePlusMinus, 
  handlePercentage, 
  handleDelete,
  OperationType
} from './calculator/CalculatorLogic';

interface CalculatorProps {
  onClose?: () => void;
}

const Calculator = ({ onClose }: CalculatorProps) => {
  const [input, setInput] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<OperationType>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        onDigitPress(e.key);
      } else if (e.key === '.') {
        onDecimalPress();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        onOperatorPress(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        onEqualPress();
      } else if (e.key === 'Escape') {
        onClearAll();
      } else if (e.key === 'Backspace') {
        const newInput = handleDelete(input);
        setInput(newInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [input, prevValue, operator, waitingForOperand]);

  const onDigitPress = (digit: string) => {
    const { newInput, newWaitingForOperand } = handleDigitPress(
      digit, 
      input, 
      waitingForOperand
    );
    
    setInput(newInput);
    setWaitingForOperand(newWaitingForOperand);
  };

  const onDecimalPress = () => {
    const { newInput, newWaitingForOperand } = handleDecimalPress(
      input, 
      waitingForOperand
    );
    
    setInput(newInput);
    setWaitingForOperand(newWaitingForOperand);
  };

  const onOperatorPress = (nextOperator: string) => {
    const { newPrevValue, newInput, newOperator, newWaitingForOperand } = handleOperatorPress(
      nextOperator,
      input,
      prevValue,
      operator
    );
    
    setPrevValue(newPrevValue);
    setInput(newInput);
    setOperator(newOperator);
    setWaitingForOperand(newWaitingForOperand);
  };

  const onEqualPress = () => {
    const { newInput, newPrevValue, newOperator, newWaitingForOperand } = handleEqualPress(
      input,
      prevValue,
      operator
    );
    
    setInput(newInput);
    setPrevValue(newPrevValue);
    setOperator(newOperator);
    setWaitingForOperand(newWaitingForOperand);
  };

  const onClearAll = () => {
    const { newInput, newPrevValue, newOperator, newWaitingForOperand } = handleClearAll();
    
    setInput(newInput);
    setPrevValue(newPrevValue);
    setOperator(newOperator);
    setWaitingForOperand(newWaitingForOperand);
  };

  const onPlusMinus = () => {
    setInput(handlePlusMinus(input));
  };

  const onPercentage = () => {
    setInput(handlePercentage(input));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-background flex flex-col h-full w-full rounded-lg`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Calculadora</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <CalculatorDisplay 
          input={input}
          prevValue={prevValue}
          operator={operator}
        />
        
        <CalculatorKeypad 
          isLandscape={isLandscape}
          onDigitPress={onDigitPress}
          onOperatorPress={onOperatorPress}
          onEqualPress={onEqualPress}
          onClearAll={onClearAll}
          onDecimal={onDecimalPress}
          onPlusMinus={onPlusMinus}
          onPercentage={onPercentage}
        />
      </div>
    </div>
  );
};

export default Calculator;
