
import { useState, useEffect } from "react";
import { AppData } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AppsTableProps {
  apps: AppData[];
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
}

const AppsTable = ({ apps, onEdit, onDelete }: AppsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  const itemsPerPage = 10;
  const isMobile = useIsMobile();

  // Detect landscape orientation on mobile devices
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Check if we should show additional columns based on device/orientation
  const isTabletPortrait = !isMobile && window.innerWidth < 1024 && !isLandscape;

  // Function to go to first page
  const goToFirstPage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  // Function to go to last page
  const goToLastPage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(totalPages);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If we have less pages than our maximum, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // We have more pages than we can show at once
      if (currentPage <= 3) {
        // If we're near the start, show first 3 pages and then ellipsis
        for (let i = 2; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis-end');
      } else if (currentPage >= totalPages - 2) {
        // If we're near the end, show ellipsis and then last 3 pages
        pageNumbers.push('ellipsis-start');
        for (let i = totalPages - 2; i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
      } else {
        // We're somewhere in the middle, show ellipsis, current page and neighbors
        pageNumbers.push('ellipsis-start');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page if not already included
      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar aplicaciones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Nombre</TableHead>
              {!isTabletPortrait && !isMobile && <TableHead className="w-[300px]">Descripción</TableHead>}
              {!isTabletPortrait && !isMobile && <TableHead className="w-[120px]">Categoría</TableHead>}
              {!isTabletPortrait && !isMobile && <TableHead className="w-[200px]">URL</TableHead>}
              <TableHead className="w-[80px] text-center">Logo</TableHead>
              {!isTabletPortrait && !isMobile && <TableHead className="w-[60px] text-center">IA</TableHead>}
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : (isTabletPortrait ? 4 : 7)} className="h-24 text-center">
                  No se encontraron aplicaciones.
                </TableCell>
              </TableRow>
            ) : (
              paginatedApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <span
                      className="font-medium cursor-pointer text-blue-600 underline transition-colors hover:text-blue-800"
                      onClick={() => onEdit(app)}
                    >
                      {app.name}
                    </span>
                  </TableCell>
                  {!isTabletPortrait && !isMobile && <TableCell className="max-w-xs truncate">{app.description}</TableCell>}
                  {!isTabletPortrait && !isMobile && <TableCell>{app.category}</TableCell>}
                  {!isTabletPortrait && !isMobile && (
                    <TableCell className="max-w-xs truncate">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {app.url}
                      </a>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="h-8 w-8 rounded mx-auto"
                    />
                  </TableCell>
                  {!isTabletPortrait && !isMobile && <TableCell className="text-center">{app.isAI ? "Sí" : "No"}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(app.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {`${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredApps.length)} de ${filteredApps.length}`}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={goToFirstPage}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  Primera
                </PaginationLink>
              </PaginationItem>
              
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  isDisabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {getPageNumbers().map((pageNumber, index) => {
                if (pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end') {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber as number);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  isDisabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={goToLastPage}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  Última
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AppsTable;
