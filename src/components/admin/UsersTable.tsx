
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
  email?: string;
}

interface UsersTableProps {
  onEdit?: (user: UserData) => void;
}

const UsersTable = ({ onEdit }: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;
  const isMobile = useIsMobile();

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      console.log("Fetching user profiles...");
      
      // Consulta simple a user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user profiles:", error);
        toast.error(`Error al cargar usuarios: ${error.message}`);
        return;
      }

      if (data) {
        console.log("Successfully fetched user profiles:", data.length);
        
        // Mapear los datos sin complicaciones
        const usersData = data.map((user: any) => ({
          id: user.id,
          username: user.username || 'Usuario sin nombre',
          created_at: user.created_at,
          updated_at: user.updated_at,
          avatar_url: user.avatar_url,
          theme_mode: user.theme_mode,
          language: user.language,
          login_count: user.login_count || 0,
          email: user.email || user.id // Usar ID como fallback para email
        }));
        
        setUsers(usersData);
        toast.success(`${usersData.length} usuarios cargados correctamente`);
      } else {
        console.log("No user profiles found");
        setUsers([]);
        toast.info("No se encontraron usuarios");
      }
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      toast.error("Error inesperado al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Configurar suscripción en tiempo real
    const channel = supabase
      .channel('users-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'user_profiles' 
        },
        (payload) => {
          console.log('Real-time user profile update:', payload);
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    await fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Deleting user:", userId);
      
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error("Error deleting user profile:", error);
        toast.error(`Error al eliminar usuario: ${error.message}`);
        return;
      }
      
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast.success("Usuario eliminado correctamente");
      
    } catch (error) {
      console.error("Unexpected error deleting user:", error);
      toast.error("Error inesperado al eliminar usuario");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            title="Actualizar lista"
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
              {!isMobile && <TableHead className="w-[180px]">ID</TableHead>}
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
                      {isMobile && (
                        <div className="text-xs text-gray-500 truncate">{user.id.substring(0, 8)}...</div>
                      )}
                    </div>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-sm">
                      <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
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
                            y no se puede deshacer.
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
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
