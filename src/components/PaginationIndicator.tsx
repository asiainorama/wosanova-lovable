
import React from 'react';

interface PaginationIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (pageIndex: number) => void;
}

const PaginationIndicator: React.FC<PaginationIndicatorProps> = ({
  totalPages,
  currentPage,
  onPageChange
}) => {
  // Mostrar un máximo de 7 indicadores con un ellipsis si hay más
  const getVisibleDots = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }).map((_, i) => i);
    }
    
    // Lógica para mostrar puntos reducidos con ellipsis
    let dots: (number | string)[] = [];
    
    if (currentPage < 3) {
      // Al principio: muestra los primeros 5, ellipsis, último
      dots = [0, 1, 2, 3, 4, 'ellipsis', totalPages - 1];
    } else if (currentPage > totalPages - 4) {
      // Al final: primer, ellipsis, últimos 5
      dots = [0, 'ellipsis', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    } else {
      // En medio: primer, ellipsis, actual-1, actual, actual+1, ellipsis, último
      dots = [
        0, 
        'ellipsis', 
        currentPage - 1, 
        currentPage, 
        currentPage + 1, 
        'ellipsis', 
        totalPages - 1
      ];
    }
    
    return dots;
  };

  return (
    <div className="flex justify-center items-center py-1 space-x-2">
      {getVisibleDots().map((dot, index) => {
        if (dot === 'ellipsis') {
          return (
            <span 
              key={`ellipsis-${index}`} 
              className="text-gray-400 dark:text-gray-600"
              style={{ fontSize: '0.7rem', opacity: 0.8 }}
            >
              •••
            </span>
          );
        }
        
        const pageIndex = dot as number;
        return (
          <button
            key={`dot-${pageIndex}`}
            onClick={() => onPageChange && onPageChange(pageIndex)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              pageIndex === currentPage
                ? 'bg-primary scale-125'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Ir a la página ${pageIndex + 1}`}
          />
        );
      })}
    </div>
  );
};

export default PaginationIndicator;
