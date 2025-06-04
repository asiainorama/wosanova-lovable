
import { useState, useEffect } from 'react';

export const useCalculator = () => {
  const [input, setInput] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

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

  return {
    input,
    prevValue,
    operator,
    clearAll,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEqual,
    handleDelete,
    handlePercentage,
    handlePlusMinus
  };
};
