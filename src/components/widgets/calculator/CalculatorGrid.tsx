
import React from 'react';
import CalculatorButton from './CalculatorButton';

interface CalculatorGridProps {
  onClearAll: () => void;
  onPlusMinus: () => void;
  onPercentage: () => void;
  onOperator: (op: string) => void;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onEqual: () => void;
}

const CalculatorGrid = ({
  onClearAll,
  onPlusMinus,
  onPercentage,
  onOperator,
  onDigit,
  onDecimal,
  onEqual
}: CalculatorGridProps) => {
  const numberButtons = [
    { label: '7', action: () => onDigit('7') },
    { label: '8', action: () => onDigit('8') },
    { label: '9', action: () => onDigit('9') },
    { label: '×', action: () => onOperator('*'), variant: 'operator' as const },
    { label: '4', action: () => onDigit('4') },
    { label: '5', action: () => onDigit('5') },
    { label: '6', action: () => onDigit('6') },
    { label: '-', action: () => onOperator('-'), variant: 'operator' as const },
    { label: '1', action: () => onDigit('1') },
    { label: '2', action: () => onDigit('2') },
    { label: '3', action: () => onDigit('3') },
    { label: '+', action: () => onOperator('+'), variant: 'operator' as const },
  ];

  return (
    <div className="grid grid-cols-4 gap-1 flex-1">
      <CalculatorButton variant="function" onClick={onClearAll}>
        AC
      </CalculatorButton>
      <CalculatorButton variant="function" onClick={onPlusMinus}>
        +/-
      </CalculatorButton>
      <CalculatorButton variant="function" onClick={onPercentage}>
        %
      </CalculatorButton>
      <CalculatorButton variant="operator" onClick={() => onOperator('/')}>
        ÷
      </CalculatorButton>
      
      {numberButtons.map((btn, index) => (
        <CalculatorButton 
          key={index}
          variant={btn.variant || 'number'}
          onClick={btn.action}
        >
          {btn.label}
        </CalculatorButton>
      ))}
      
      <CalculatorButton onClick={() => onDigit('0')}>
        0
      </CalculatorButton>
      <CalculatorButton onClick={onDecimal}>
        .
      </CalculatorButton>
      <CalculatorButton variant="equal" onClick={onEqual}>
        =
      </CalculatorButton>
    </div>
  );
};

export default CalculatorGrid;
