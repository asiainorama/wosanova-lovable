
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  username?: string;
  created_at: string;
  updated_at: string | null;
  avatar_url?: string;
  theme_mode?: string;
  language?: string;
}

interface UsersTableProps {
  onEdit?: (user: UserData) => void;
}

const UsersTable = ({ onEdit }: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch users from user_profiles table
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');
        
        if (error) {
          toast.error(`Error al cargar usuarios: ${error.message}`);
          console.error("Error fetching users:", error);
          return;
        }

        if (data) {
          setUsers(data as UserData[]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  
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
            placeholder="Buscar usuarios..."
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
              <TableHead className="w-[200px]">ID de Usuario</TableHead>
              <TableHead className="w-[150px]">Nombre de Usuario</TableHead>
              {!isTabletPortrait && !isMobile && <TableHead className="w-[180px]">Fecha de creación</TableHead>}
              {!isTabletPortrait && !isMobile && <TableHead className="w-[180px]">Último acceso</TableHead>}
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isTabletPortrait || isMobile ? 3 : 5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isTabletPortrait || isMobile ? 3 : 5} className="h-24 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <span
                      className="font-medium cursor-pointer text-blue-600 underline transition-colors hover:text-blue-800"
                      onClick={() => onEdit && onEdit(user)}
                    >
                      {user.id}
                    </span>
                  </TableCell>
                  <TableCell>{user.username || "—"}</TableCell>
                  {!isTabletPortrait && !isMobile && (
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                  )}
                  {!isTabletPortrait && !isMobile && (
                    <TableCell>
                      {user.updated_at 
                        ? new Date(user.updated_at).toLocaleDateString('es-ES') 
                        : "Nunca"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la cuenta de usuario y no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  // Delete from user_profiles table
                                  const { error } = await supabase
                                    .from('user_profiles')
                                    .delete()
                                    .eq('id', user.id);
                                  
                                  if (error) {
                                    toast.error(`Error al eliminar usuario: ${error.message}`);
                                    return;
                                  }
                                  
                                  // Remove from local state
                                  setUsers(users.filter(u => u.id !== user.id));
                                  toast.success("Usuario eliminado correctamente");
                                } catch (error) {
                                  console.error("Error deleting user:", error);
                                  toast.error("Error al eliminar usuario");
                                }
                              }}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
            {`${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredUsers.length)} de ${filteredUsers.length}`}
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

export default UsersTable;
