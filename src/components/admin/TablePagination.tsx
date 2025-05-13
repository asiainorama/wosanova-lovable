
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination = ({ currentPage, totalPages, onPageChange }: TablePaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-2 p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
      
      <span className="text-sm">
        Página {currentPage} de {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default TablePagination;
