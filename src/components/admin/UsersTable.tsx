import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { useTheme } from "@/contexts/ThemeContext";

// Define interface for auth user data returned from the RPC function
interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string | null;
  login_count: number | null;
}

const UsersTable = () => {
  const [users, setUsers] = useState<Tables<"user_profiles">[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { mode } = useTheme(); // Fix: use mode instead of isDarkMode
  const [loginCounts, setLoginCounts] = useState<Record<string, number>>({});

  // Define how many users to show per page
  const USERS_PER_PAGE = 20;

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, get the total count of users for pagination
      const { count, error: countError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        toast.error(`Error counting users: ${countError.message}`);
        return;
      }
      
      setTotalUsers(count || 0);
      
      // Then fetch the current page of users
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE - 1);
      
      if (error) {
        toast.error(`Error loading users: ${error.message}`);
        return;
      }
      
      if (userData) {
        setUsers(userData);
      }
      
      // Get auth data with a direct function call to the admin API
      // Fix: Specify both generic type parameters for the RPC call
      const { data: authData, error: authError } = await supabase.rpc<AuthUser[], unknown>('get_auth_users');
      
      if (authError) {
        toast.error(`Error al cargar datos de autenticación: ${authError.message}`);
        return;
      }
      
      if (authData) {
        // Fix: Assert that authData is an array
        const authArray = authData as AuthUser[];
        console.log('Auth data loaded:', authArray.length);
      } else {
        console.warn('No auth data returned from get_auth_users');
        return;
      }
      
      // Create a map of user IDs to login counts
      const loginCountMap: Record<string, number> = {};
      
      // Fix: Assert that authData is an array before using forEach
      const authArray = authData as AuthUser[];
      if (authArray && Array.isArray(authArray)) {
        authArray.forEach((user: AuthUser) => {
          const id = user.id;
          const count = user.login_count || 0;
          loginCountMap[id] = count;
        });
        
        setLoginCounts(loginCountMap);
      }
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const id = user.id.toLowerCase();
    
    return username.includes(query) || id.includes(query);
  });

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Usuarios ({totalUsers})</h2>
        <div className="w-full md:w-64">
          <Input
            placeholder="Buscar usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tema</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Idioma</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inicios</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creado</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm">
                  Cargando usuarios...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.username || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.theme_mode === "dark" ? "outline" : "default"}>
                      {user.theme_mode || "default"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.language === "en" ? "outline" : "default"}>
                      {user.language || "default"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {loginCounts[user.id] || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
