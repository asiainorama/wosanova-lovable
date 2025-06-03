
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalculatorProps {
  onClose?: () => void;
}

const Calculator = ({ onClose }: CalculatorProps) => {
  const [input, setInput] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // Numbers
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      }
      // Operators
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('*');
      else if (e.key === '/') handleOperator('/');
      // Special keys
      else if (e.key === 'Enter' || e.key === '=') handleEqual();
      else if (e.key === '.') handleDecimal();
      else if (e.key === 'Escape') clearAll();
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === '%') handlePercentage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, operator, prevValue, waitingForOperand]);

  const clearAll = () => {
    setInput('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setInput(digit);
      setWaitingForOperand(false);
    } else {
      setInput(input === '0' ? digit : input + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setInput('0.');
      setWaitingForOperand(false);
    } else if (input.indexOf('.') === -1) {
      setInput(input + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(input);

    if (prevValue === null) {
      setPrevValue(input);
    } else if (operator) {
      const result = performCalculation(parseFloat(prevValue), inputValue, operator);
      setInput(String(result));
      setPrevValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (!operator || prevValue === null) return;

    const inputValue = parseFloat(input);
    const result = performCalculation(parseFloat(prevValue), inputValue, operator);
    
    setInput(String(result));
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleDelete = () => {
    if (input.length === 1) {
      setInput('0');
    } else {
      setInput(input.slice(0, -1));
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(input);
    setInput(String(value / 100));
  };

  const handlePlusMinus = () => {
    const value = parseFloat(input);
    setInput(String(-value));
  };

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
        {/* Display area with fixed height */}
        <div className={`bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-3 text-right flex flex-col justify-center ${isMobile ? 'h-24' : 'h-20'}`}>
          <div className={`font-medium truncate flex items-center justify-end ${isMobile ? 'text-4xl min-h-[3rem]' : 'text-3xl min-h-[2.25rem]'}`}>
            {input}
          </div>
          {operator && prevValue && (
            <div className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-base min-h-[1.5rem]' : 'text-sm min-h-[1.25rem]'}`}>
              {prevValue} {operator}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-1 flex-1">
          <Button 
            variant="outline" 
            className={`aspect-square bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto ${isMobile ? 'text-2xl' : 'text-xl'}`}
            onClick={clearAll}
          >
            AC
          </Button>
          <Button 
            variant="outline" 
            className={`aspect-square bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto ${isMobile ? 'text-2xl' : 'text-xl'}`}
            onClick={handlePlusMinus}
          >
            +/-
          </Button>
          <Button 
            variant="outline" 
            className={`aspect-square bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto ${isMobile ? 'text-2xl' : 'text-xl'}`}
            onClick={handlePercentage}
          >
            %
          </Button>
          <Button 
            variant="outline" 
            className={`aspect-square bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 p-0 h-auto ${isMobile ? 'text-2xl' : 'text-xl'}`}
            onClick={() => handleOperator('/')}
          >
            ÷
          </Button>
          
          {/* Numbers and operators - continuing grid */}
          {[
            { label: '7', action: () => handleDigit('7') },
            { label: '8', action: () => handleDigit('8') },
            { label: '9', action: () => handleDigit('9') },
            { label: '×', action: () => handleOperator('*'), isOperator: true },
            { label: '4', action: () => handleDigit('4') },
            { label: '5', action: () => handleDigit('5') },
            { label: '6', action: () => handleDigit('6') },
            { label: '-', action: () => handleOperator('-'), isOperator: true },
            { label: '1', action: () => handleDigit('1') },
            { label: '2', action: () => handleDigit('2') },
            { label: '3', action: () => handleDigit('3') },
            { label: '+', action: () => handleOperator('+'), isOperator: true },
          ].map((btn, index) => (
            <Button 
              key={index}
              variant="outline" 
              className={`aspect-square p-0 h-auto ${isMobile ? 'text-3xl' : 'text-2xl'} ${
                btn.isOperator 
                  ? 'bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50' 
                  : ''
              }`}
              onClick={btn.action}
            >
              {btn.label}
            </Button>
          ))}
          
          {/* Bottom row */}
          <Button 
            variant="outline" 
            className={`aspect-square p-0 h-auto ${isMobile ? 'text-3xl' : 'text-2xl'}`}
            onClick={() => handleDigit('0')}
          >
            0
          </Button>
          <Button 
            variant="outline" 
            className={`aspect-square p-0 h-auto ${isMobile ? 'text-3xl' : 'text-2xl'}`}
            onClick={handleDecimal}
          >
            .
          </Button>
          <Button 
            variant="outline" 
            className={`col-span-2 bg-orange-500 hover:bg-orange-600 text-white p-0 h-auto aspect-[2/1] ${isMobile ? 'text-2xl' : 'text-xl'}`}
            onClick={handleEqual}
          >
            =
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
