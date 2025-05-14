
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

// Define hook return type for better type safety
interface UseUsersReturn {
  users: Tables<"user_profiles">[];
  loginCounts: Record<string, number>;
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalUsers: number;
  usersPerPage: number;
  refreshUsers: () => Promise<void>;
}

export const useUsers = (initialPage = 1, usersPerPage = 20): UseUsersReturn => {
  const [users, setUsers] = useState<Tables<"user_profiles">[]>([]);
  const [loginCounts, setLoginCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get total count of users for pagination
      const { count, error: countError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        toast.error(`Error counting users: ${countError.message}`);
        return;
      }
      
      setTotalUsers(count || 0);
      
      // Fetch the current page of users
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
      const { data: authData, error: authError } = await supabase.rpc<AuthUser[], Record<string, never>>(
        'get_auth_users',
        {}
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
      
      // Log authData details for debugging
      console.log('Auth data loaded:', Array.isArray(authData) ? authData.length : 'no data');
      
      // Process auth data safely
      if (Array.isArray(authData)) {
        authData.forEach((user: AuthUser) => {
          if (user && user.id) {
            loginCountMap[user.id] = user.login_count || 0;
          }
        });
      }
      
      setLoginCounts(loginCountMap);
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setTimeout(() => setLoading(false), 200); // Avoid flash of "no users" message
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
    usersPerPage,
    refreshUsers: fetchUsers
  };
};
