
import React from 'react';
import CalculatorButton from './CalculatorButton';

interface CalculatorKeypadProps {
  isLandscape: boolean;
  onDigitPress: (digit: string) => void;
  onOperatorPress: (operator: string) => void;
  onEqualPress: () => void;
  onClearAll: () => void;
  onDecimal: () => void;
  onPlusMinus: () => void;
  onPercentage: () => void;
}

const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  isLandscape,
  onDigitPress,
  onOperatorPress,
  onEqualPress,
  onClearAll,
  onDecimal,
  onPlusMinus,
  onPercentage
}) => {
  return (
    <div className={`grid ${isLandscape ? 'grid-cols-6' : 'grid-cols-4'} gap-0 flex-1`}>
      <CalculatorButton 
        value="AC" 
        onClick={onClearAll}
        variant="function"
      />
      <CalculatorButton 
        value="+/-" 
        onClick={onPlusMinus}
        variant="function"
      />
      <CalculatorButton 
        value="%" 
        onClick={onPercentage}
        variant="function"
      />
      <CalculatorButton 
        value="÷" 
        onClick={() => onOperatorPress('/')}
        variant="operator"
      />
      
      {/* Row 2 */}
      <CalculatorButton 
        value="7" 
        onClick={() => onDigitPress('7')}
      />
      <CalculatorButton 
        value="8" 
        onClick={() => onDigitPress('8')}
      />
      <CalculatorButton 
        value="9" 
        onClick={() => onDigitPress('9')}
      />
      <CalculatorButton 
        value="×" 
        onClick={() => onOperatorPress('*')}
        variant="operator"
      />
      
      {/* Row 3 */}
      <CalculatorButton 
        value="4" 
        onClick={() => onDigitPress('4')}
      />
      <CalculatorButton 
        value="5" 
        onClick={() => onDigitPress('5')}
      />
      <CalculatorButton 
        value="6" 
        onClick={() => onDigitPress('6')}
      />
      <CalculatorButton 
        value="-" 
        onClick={() => onOperatorPress('-')}
        variant="operator"
      />
      
      {/* Row 4 */}
      <CalculatorButton 
        value="1" 
        onClick={() => onDigitPress('1')}
      />
      <CalculatorButton 
        value="2" 
        onClick={() => onDigitPress('2')}
      />
      <CalculatorButton 
        value="3" 
        onClick={() => onDigitPress('3')}
      />
      <CalculatorButton 
        value="+" 
        onClick={() => onOperatorPress('+')}
        variant="operator"
      />
      
      {/* Row 5 */}
      <CalculatorButton 
        value="0" 
        onClick={() => onDigitPress('0')}
        className={isLandscape ? 'col-span-2' : 'col-span-1'}
      />
      <CalculatorButton 
        value="." 
        onClick={onDecimal}
      />
      <CalculatorButton 
        value="=" 
        onClick={onEqualPress}
        variant="equals"
        className={isLandscape ? 'col-span-3' : 'col-span-2'}
      />
    </div>
  );
};

export default CalculatorKeypad;
