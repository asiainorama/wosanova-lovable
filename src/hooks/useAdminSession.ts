
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

        // Solo verificar admin si hay sesión válida
        if (data.session?.user?.email) {
          const isAdminUser =
            data.session.user.email.endsWith("@wosanova.com") ||
            data.session.user.email === "asiainorama@gmail.com";
          setIsAdmin(isAdminUser);

          if (!isAdminUser) {
            console.log("Non-admin user detected:", data.session.user.email);
          }
        } else {
          // Sin sesión válida, definitivamente no es admin
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAdmin(false); // Por seguridad, nunca admin en caso de error
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (session?.user?.email) {
        const isAdminUser =
          session.user.email.endsWith("@wosanova.com") ||
          session.user.email === "asiainorama@gmail.com";
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
};

export default useAdminSession;
