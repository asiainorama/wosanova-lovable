
import React from 'react';

interface PaginationIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

const PaginationIndicator: React.FC<PaginationIndicatorProps> = ({
  totalPages,
  currentPage,
  onPageChange
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange?.(index)}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            currentPage === index 
              ? 'bg-primary scale-125' 
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          }`}
          aria-label={`Ir a la página ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default PaginationIndicator;
