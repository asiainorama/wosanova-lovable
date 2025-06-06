
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { FloatingWidgetsProvider } from "./contexts/FloatingWidgetsContext";
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
import SidebarMenu from './components/SidebarMenu';
import FloatingWidgetsContainer from './components/FloatingWidgetsContainer';
import { shouldSkipAuth } from './utils/environmentUtils';

// Importar el script de sincronización para que esté disponible globalmente
import "./scripts/syncAppsToSupabase";

// Move AppContextUpdater import here but don't render it at the top level
import { AppContextUpdater } from "./contexts/AppContextUpdater";

const queryClient = new QueryClient();

// Create a wrapper component that uses AppContextUpdater safely
const AppWithContextUpdater = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Touch event handlers for swipe detection
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Check if it's a swipe with sufficient distance and speed, and not too much vertical movement
      const isValidSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 500;

      if (!isValidSwipe) return;

      // Right swipe from left edge to open sidebar
      if (startX <= 100 && deltaX > 0) {
        setIsSidebarOpen(true);
      }
      
      // Left swipe from right edge to close sidebar (when sidebar is open)
      if (isSidebarOpen && startX >= window.innerWidth - 100 && deltaX < 0) {
        setIsSidebarOpen(false);
      }
    };

    // Listen for custom sidebar open events from Header
    const handleSidebarOpenEvent = () => {
      setIsSidebarOpen(true);
    };

    // Add event listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('sidebarOpenRequested', handleSidebarOpenEvent);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('sidebarOpenRequested', handleSidebarOpenEvent);
    };
  }, [isSidebarOpen]);

  return (
    <>
      <AppContextUpdater />
      {children}
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onOpenChange={setIsSidebarOpen} 
      />
      <FloatingWidgetsContainer />
    </>
  );
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skipAuthCheck, setSkipAuthCheck] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in the preview environment
    const skipAuth = shouldSkipAuth();
    setSkipAuthCheck(skipAuth);
    
    if (skipAuth) {
      console.log("Running in Lovable preview mode - Bypassing auth checks");
      setIsLoading(false);
      return;
    }
    
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
              <FloatingWidgetsProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <div style={{ background: 'transparent', minHeight: '100vh' }}>
                      <InstallAppPrompt />
                      <Routes>
                        <Route
                          path="/"
                          element={session || skipAuthCheck ? 
                            <AppWithContextUpdater>
                              <Index />
                            </AppWithContextUpdater> : 
                            <Navigate to="/auth" />
                          }
                        />
                        <Route
                          path="/catalog"
                          element={session || skipAuthCheck ? 
                            <AppWithContextUpdater>
                              <Catalog />
                            </AppWithContextUpdater> : 
                            <Navigate to="/auth" />
                          }
                        />
                        <Route
                          path="/manage"
                          element={session || skipAuthCheck ? 
                            <AppWithContextUpdater>
                              <Manage />
                            </AppWithContextUpdater> : 
                            <Navigate to="/auth" />
                          }
                        />
                        <Route
                          path="/profile"
                          element={session || skipAuthCheck ? 
                            <AppWithContextUpdater>
                              <Profile />
                            </AppWithContextUpdater> : 
                            <Navigate to="/auth" />
                          }
                        />
                        <Route
                          path="/admin"
                          element={session || skipAuthCheck ? 
                            <AppWithContextUpdater>
                              <Admin />
                            </AppWithContextUpdater> : 
                            <Navigate to="/auth" />
                          }
                        />
                        <Route
                          path="/auth"
                          element={!session && !skipAuthCheck ? <Auth /> : <Navigate to="/" />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </FloatingWidgetsProvider>
            </AppProvider>
          </LanguageProvider>
        </BackgroundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
