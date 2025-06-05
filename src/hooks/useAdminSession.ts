
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shouldSkipAuth } from "@/utils/environmentUtils";

const useAdminSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we should bypass authentication in development mode
        if (shouldSkipAuth()) {
          console.log("Running in Lovable preview mode - Granting admin access");
          setIsAdmin(true); // Auto grant admin privileges in dev mode
          setSession({ user: { email: "development@wosanova.com" } }); // Mock session
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session?.user?.email) {
          const isAdminUser =
            data.session.user.email.endsWith("@wosanova.com") ||
            data.session.user.email === "asiainorama@gmail.com";
          setIsAdmin(isAdminUser);

          if (!isAdminUser) {
            toast.error("Acceso restringido a administradores");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return { session, isAdmin, loading };
};

export default useAdminSession;
