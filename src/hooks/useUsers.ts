
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

// Define interface for auth user data returned from the RPC function
export interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string | null;
  login_count: number | null;
}

export const useUsers = (initialPage = 1, usersPerPage = 20) => {
  const [users, setUsers] = useState<Tables<"user_profiles">[]>([]);
  const [loginCounts, setLoginCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalUsers, setTotalUsers] = useState(0);

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
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);
      
      if (error) {
        toast.error(`Error loading users: ${error.message}`);
        return;
      }
      
      if (userData) {
        setUsers(userData);
      }
      
      // Get auth data from the RPC function
      // Fix the typing by using a simpler approach without generic parameters
      const { data: authData, error: authError } = await supabase.rpc(
        'get_auth_users'
      );
      
      if (authError) {
        toast.error(`Error al cargar datos de autenticación: ${authError.message}`);
        return;
      }
      
      // Check if authData exists before processing
      if (!authData) {
        console.warn('No auth data returned from get_auth_users');
        return;
      }
      
      // Create a map of user IDs to login counts
      const loginCountMap: Record<string, number> = {};
      
      // Type assertion to treat authData as array of AuthUser
      console.log('Auth data loaded:', Array.isArray(authData) ? authData.length : 'not an array');
      
      if (Array.isArray(authData)) {
        authData.forEach((user: AuthUser) => {
          if (user && user.id) {
            const id = user.id;
            const count = user.login_count || 0;
            loginCountMap[id] = count;
          }
        });
      }
      
      setLoginCounts(loginCountMap);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setTimeout(() => setLoading(false), 200); // Avoid flash of "no apps" message
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  return {
    users,
    loginCounts,
    loading,
    currentPage,
    setCurrentPage,
    totalUsers,
    usersPerPage
  };
};
