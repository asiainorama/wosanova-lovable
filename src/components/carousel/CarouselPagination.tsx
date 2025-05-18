
import React from 'react';
import PaginationIndicator from '../PaginationIndicator';

interface CarouselPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
}

const CarouselPagination: React.FC<CarouselPaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination-container">
      <PaginationIndicator
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default React.memo(CarouselPagination);
