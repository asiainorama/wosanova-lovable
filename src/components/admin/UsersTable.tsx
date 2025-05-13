
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
import { Search, RefreshCw } from "lucide-react";
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
  login_count?: number;
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
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 20; // Increased from 10 to show more users per page
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

  // Fetch users from user_profiles table and auth users for login count
  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      
      // Get user profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        toast.error(`Error al cargar perfiles: ${profilesError.message}`);
        console.error("Error fetching profiles:", profilesError);
        setRefreshing(false);
        return;
      }
      
      // Get auth data with a direct function call to the admin API
      const { data: authData, error: authError } = await supabase.rpc('get_auth_users');
      
      if (authError) {
        toast.error(`Error al cargar datos de autenticación: ${authError.message}`);
        console.error("Error fetching auth data:", authError);
        
        // Even if we fail to get auth data, still set the profiles
        setUsers(profilesData || []);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Auth data:", authData);
      
      // Create a map of user IDs to login counts
      const loginCountMap = new Map();
      if (authData && Array.isArray(authData)) {
        authData.forEach(user => {
          const id = user.id;
          const count = user.login_count || 0;
          loginCountMap.set(id, count);
        });
      }
      
      // Combine profile data with login counts
      const combinedUsers = (profilesData || []).map(profile => ({
        ...profile,
        login_count: loginCountMap.get(profile.id) || 0
      }));
      
      console.log(`Loaded ${combinedUsers.length} users with login data`);
      setUsers(combinedUsers);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    
    // Set up a real-time subscription for user profile changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'user_profiles' 
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchUsers(); // Reload users when changes happen
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    fetchUsers();
    toast.info("Actualizando lista de usuarios...");
  };

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
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      // If we have less pages than our maximum, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // We have more pages than we can show at once
      if (currentPage <= 2) {
        // If we're near the start, show first 2-3 pages and then ellipsis
        for (let i = 2; i <= Math.min(3, maxVisiblePages-1); i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis-end');
      } else if (currentPage >= totalPages - 1) {
        // If we're near the end, show ellipsis and then last 2-3 pages
        pageNumbers.push('ellipsis-start');
        for (let i = Math.max(totalPages - 2, 2); i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
      } else {
        // We're somewhere in the middle, show ellipsis, current page and neighbors
        pageNumbers.push('ellipsis-start');
        
        if (maxVisiblePages >= 5) {
          pageNumbers.push(currentPage - 1);
        }
        
        pageNumbers.push(currentPage);
        
        if (maxVisiblePages >= 5) {
          pageNumbers.push(currentPage + 1);
        }
        
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
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="relative"
          title="Actualizar lista de usuarios"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Nombre de Usuario</TableHead>
              {!isMobile && <TableHead className="w-[180px]">Fecha de creación</TableHead>}
              <TableHead className="w-[100px]">Accesos</TableHead>
              <TableHead className="w-[180px]">Último acceso</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 5} className="h-24 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username || "Usuario sin nombre"}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    {user.login_count || 0}
                  </TableCell>
                  <TableCell>
                    {user.updated_at 
                      ? new Date(user.updated_at).toLocaleDateString('es-ES') 
                      : "Nunca"}
                  </TableCell>
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
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 w-full sm:w-auto text-center sm:text-left">
            {`${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredUsers.length)} de ${filteredUsers.length}`}
          </div>
          <Pagination className="w-full sm:w-auto">
            <PaginationContent className="flex-wrap justify-center">
              {!isMobile && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={goToFirstPage}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  >
                    Primera
                  </PaginationLink>
                </PaginationItem>
              )}
              
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
                    <PaginationItem key={`ellipsis-${index}`} className={isMobile ? "hidden sm:block" : ""}>
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
              
              {!isMobile && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={goToLastPage}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  >
                    Última
                  </PaginationLink>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
