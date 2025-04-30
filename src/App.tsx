
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Manage from "./pages/Manage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

// Move AppContextUpdater import here but don't render it at the top level
import { AppContextUpdater } from "./contexts/AppContextUpdater";

const queryClient = new QueryClient();

// Create a wrapper component that uses AppContextUpdater safely
const AppWithContextUpdater = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppContextUpdater />
      {children}
    </>
  );
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Authentication initialization started");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, session ? "session exists" : "no session");
        setSession(session);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
          toast.error("Error al verificar la sesión");
        } else {
          console.log("Initial session check:", data.session ? "session exists" : "no session");
          setSession(data.session);
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={session ? 
                      <AppWithContextUpdater>
                        <Index />
                      </AppWithContextUpdater> : 
                      <Navigate to="/auth" />
                    }
                  />
                  <Route
                    path="/catalog"
                    element={session ? 
                      <AppWithContextUpdater>
                        <Catalog />
                      </AppWithContextUpdater> : 
                      <Navigate to="/auth" />
                    }
                  />
                  <Route
                    path="/manage"
                    element={session ? 
                      <AppWithContextUpdater>
                        <Manage />
                      </AppWithContextUpdater> : 
                      <Navigate to="/auth" />
                    }
                  />
                  <Route
                    path="/profile"
                    element={session ? 
                      <AppWithContextUpdater>
                        <Profile />
                      </AppWithContextUpdater> : 
                      <Navigate to="/auth" />
                    }
                  />
                  <Route
                    path="/auth"
                    element={!session ? <Auth /> : <Navigate to="/" />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AppProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
