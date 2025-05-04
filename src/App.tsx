import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BackgroundProvider } from './contexts/BackgroundContext';
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
        
        // Apply saved theme and language preferences on login/logout
        const themeMode = localStorage.getItem('themeMode');
        const themeColor = localStorage.getItem('themeColor');
        const language = localStorage.getItem('language');
        
        if (themeMode === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark'); 
        }
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
    <ThemeProvider>
      <LanguageProvider>
        <BackgroundProvider>
          <AppContextProvider>
            <Toaster />
            <InstallPrompt />
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
          </AppContextProvider>
        </BackgroundProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
