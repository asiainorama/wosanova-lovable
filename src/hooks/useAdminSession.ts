
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { shouldSkipAuth } from "@/utils/environmentUtils";

const useAdminSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin_user');
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (shouldSkipAuth()) {
          console.log("Running in Lovable preview mode - Granting admin access");
          setIsAdmin(true);
          setSession({ user: { email: "development@wosanova.com" } });
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session?.user) {
          const adminStatus = await checkAdminRole();
          setIsAdmin(adminStatus);
          if (!adminStatus) {
            console.log("Non-admin user detected");
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (shouldSkipAuth()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    if (!shouldSkipAuth()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const adminStatus = await checkAdminRole();
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return { session, isAdmin, loading };
};

export default useAdminSession;
