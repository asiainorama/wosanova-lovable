
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalculatorDisplayProps {
  input: string;
  prevValue: string | null;
  operator: string | null;
}

const CalculatorDisplay = ({ input, prevValue, operator }: CalculatorDisplayProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 p-5 rounded-lg mb-3 text-right flex flex-col justify-center ${isMobile ? 'h-40' : 'h-20'}`}>
      <div className={`font-medium truncate flex items-center justify-end ${isMobile ? 'text-4xl min-h-[3rem]' : 'text-3xl min-h-[2.25rem]'}`}>
        {input}
      </div>
      {operator && prevValue && (
        <div className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-base min-h-[1.5rem]' : 'text-sm min-h-[1.25rem]'}`}>
          {prevValue} {operator}
        </div>
      )}
    </div>
  );
};

export default CalculatorDisplay;
