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
import InstallPrompt from "./components/InstallPrompt";
import CalculatorWidget from './pages/widgets/CalculatorWidget';

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Do NOT force apply theme here - let ThemeProvider handle it
        // This preserves user's selected theme across login/logout events
        console.log("Auth state changed:", event, session ? "user present" : "no user");
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
        } else {
          setSession(data.session);
          console.log("Initial session check:", data.session ? "user present" : "no user");
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
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
              <InstallPrompt />
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
                  <Route path="/widgets/calculator" element={<CalculatorWidget />} />
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
