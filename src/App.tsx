
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Manage from "./pages/Manage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Admin from "./pages/admin";
import InstallAppPrompt from './components/InstallAppPrompt';

// Importar el script de sincronización para que esté disponible globalmente
import "./scripts/syncAppsToSupabase";

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
      <div className="flex h-screen w-screen items-center justify-center">
        <img 
          src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
          alt="WosaNova Logo" 
          className="w-24 h-24"
        />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BackgroundProvider>
          <LanguageProvider>
            <AppProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <div style={{ background: 'transparent', minHeight: '100vh' }}>
                    <InstallAppPrompt />
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
                        path="/admin"
                        element={session ? <Admin /> : <Navigate to="/auth" />}
                      />
                      <Route
                        path="/auth"
                        element={!session ? <Auth /> : <Navigate to="/" />}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </AppProvider>
          </LanguageProvider>
        </BackgroundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
