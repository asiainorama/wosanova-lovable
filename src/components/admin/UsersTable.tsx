
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
  login_count: number;
  email?: string; // Add email from auth.users
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

  // Enhanced fetch function that gets ALL user data including auth info
  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      console.log("Fetching users with enhanced query...");
      
      // Get all users from auth.users and join with user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          email:id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user profiles:", error);
        toast.error(`Error al cargar perfiles de usuario: ${error.message}`);
        
        // Fallback: try to fetch auth users directly (this requires admin privileges)
        console.log("Trying fallback method...");
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          if (authError) {
            console.error("Auth admin error:", authError);
          } else {
            console.log("Auth users found:", authData?.users?.length || 0);
            // Create profiles for missing users
            if (authData?.users) {
              for (const authUser of authData.users) {
                const { error: insertError } = await supabase
                  .from('user_profiles')
                  .upsert({
                    id: authUser.id,
                    username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Usuario',
                    login_count: 0,
                    created_at: authUser.created_at,
                    updated_at: authUser.updated_at || authUser.created_at
                  }, { onConflict: 'id' });
                
                if (insertError) {
                  console.error("Error creating profile for user:", authUser.id, insertError);
                }
              }
              // Retry the original query
              return fetchUsers();
            }
          }
        } catch (adminError) {
          console.error("Admin listUsers not available:", adminError);
        }
        return;
      }

      if (data) {
        console.log("Successfully fetched user profiles:", data.length);
        
        // Get additional email data from auth users via RPC or direct query if available
        const usersData = await Promise.all(data.map(async (user: any) => {
          let email = '';
          try {
            // Try to get email from auth metadata or make a separate call
            const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
            email = authUser?.user?.email || '';
          } catch (e) {
            console.log("Could not fetch email for user:", user.id);
          }

          return {
            id: user.id,
            username: user.username || email?.split('@')[0] || 'Usuario sin nombre',
            created_at: user.created_at,
            updated_at: user.updated_at,
            avatar_url: user.avatar_url,
            theme_mode: user.theme_mode,
            language: user.language,
            login_count: user.login_count || 0,
            email: email
          };
        }));
        
        setUsers(usersData);
        toast.success(`${usersData.length} usuarios cargados correctamente`);
      } else {
        console.log("No user profiles found");
        setUsers([]);
      }
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      toast.error("Error inesperado al cargar usuarios");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced initialization with better error handling
  useEffect(() => {
    const initializeUsers = async () => {
      console.log("Initializing users table...");
      await fetchUsers();
      
      // Set up real-time subscription for user_profiles changes
      const channel = supabase
        .channel('admin-users-realtime')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public',
            table: 'user_profiles' 
          },
          (payload) => {
            console.log('Real-time user profile update:', payload);
            // Refresh the data when changes occur
            fetchUsers();
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      return () => {
        console.log("Cleaning up real-time subscription");
        supabase.removeChannel(channel);
      };
    };

    initializeUsers();
  }, []);

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    await fetchUsers();
    toast.info("Lista de usuarios actualizada");
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Deleting user:", userId);
      
      // Delete from user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error("Error deleting user profile:", error);
        toast.error(`Error al eliminar perfil de usuario: ${error.message}`);
        return;
      }
      
      // Remove from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast.success("Usuario eliminado correctamente");
      
    } catch (error) {
      console.error("Unexpected error deleting user:", error);
      toast.error("Error inesperado al eliminar usuario");
    }
  };

  // Enhanced filtering that includes email
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage <= 2) {
        for (let i = 2; i <= Math.min(3, maxVisiblePages-1); i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis-end');
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push('ellipsis-start');
        for (let i = Math.max(totalPages - 2, 2); i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
      } else {
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
      
      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios por nombre, ID o email..."
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
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {users.length} usuarios
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Usuario</TableHead>
              {!isMobile && <TableHead className="w-[180px]">Email</TableHead>}
              {!isMobile && <TableHead className="w-[130px]">Creado</TableHead>}
              <TableHead className="w-[80px] text-center">Accesos</TableHead>
              <TableHead className="w-[130px]">Último acceso</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 6} className="h-24 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <span>Cargando usuarios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 6} className="h-24 text-center">
                  {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda." : "No se encontraron usuarios registrados."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{user.username}</div>
                      {isMobile && user.email && (
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      )}
                    </div>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-sm">
                      {user.email ? (
                        <span className="truncate block max-w-[160px]" title={user.email}>
                          {user.email}
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin email</span>
                      )}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </TableCell>
                  )}
                  <TableCell className="text-center font-mono">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {user.login_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.updated_at 
                      ? new Date(user.updated_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })
                      : "Nunca"}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                        >
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el perfil del usuario "{user.username}" 
                            ({user.email || user.id}) y no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar usuario
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            {searchTerm && ` (filtrado de ${users.length} total)`}
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
