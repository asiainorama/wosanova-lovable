
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
  const [isPortrait, setIsPortrait] = useState<boolean>(true);

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

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
      // Fallback close method if no onClose provided
      window.history.back();
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
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-3 text-right">
          <div className="text-4xl font-medium truncate">{input}</div>
          {operator && prevValue && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {prevValue} {operator}
            </div>
          )}
        </div>
        
        <div className={`grid ${isPortrait ? 'grid-cols-4' : 'grid-cols-6'} gap-0 flex-1`}>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto"
            onClick={clearAll}
          >
            AC
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto"
            onClick={handlePlusMinus}
          >
            +/-
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-0 h-auto"
            onClick={handlePercentage}
          >
            %
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 p-0 h-auto"
            onClick={() => handleOperator('/')}
          >
            ÷
          </Button>
          
          {/* Row 2 */}
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('7')}
          >
            7
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('8')}
          >
            8
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('9')}
          >
            9
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 p-0 h-auto"
            onClick={() => handleOperator('*')}
          >
            ×
          </Button>
          
          {/* Row 3 */}
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('4')}
          >
            4
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('5')}
          >
            5
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('6')}
          >
            6
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 p-0 h-auto"
            onClick={() => handleOperator('-')}
          >
            -
          </Button>
          
          {/* Row 4 */}
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('1')}
          >
            1
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('2')}
          >
            2
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={() => handleDigit('3')}
          >
            3
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-xl bg-orange-100 hover:bg-orange-200 text-orange-500 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 p-0 h-auto"
            onClick={() => handleOperator('+')}
          >
            +
          </Button>
          
          {/* Row 5 */}
          <Button 
            variant="outline" 
            className={`aspect-square text-2xl p-0 h-auto ${isPortrait ? 'col-span-1' : 'col-span-2'}`}
            onClick={() => handleDigit('0')}
          >
            0
          </Button>
          <Button 
            variant="outline" 
            className="aspect-square text-2xl p-0 h-auto"
            onClick={handleDecimal}
          >
            .
          </Button>
          <Button 
            variant="outline" 
            className={`text-xl bg-orange-500 hover:bg-orange-600 text-white p-0 h-auto ${isPortrait ? 'col-span-2' : 'col-span-1'}`}
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
