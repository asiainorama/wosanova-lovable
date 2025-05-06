
import React from 'react';

interface CalculatorDisplayProps {
  input: string;
  prevValue: string | null;
  operator: string | null;
}

const CalculatorDisplay = ({ input, prevValue, operator }: CalculatorDisplayProps) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-3 text-right">
      <div className="text-4xl font-medium truncate">{input}</div>
      {operator && prevValue && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {prevValue} {operator}
        </div>
      )}
    </div>
  );
};

export default CalculatorDisplay;
