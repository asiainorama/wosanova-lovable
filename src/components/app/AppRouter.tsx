
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Session } from '@supabase/supabase-js';
import Index from "@/pages/Index";
import Catalog from "@/pages/Catalog";
import Manage from "@/pages/Manage";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/admin";
import InstallAppPrompt from '@/components/InstallAppPrompt';
import { AppWithContextUpdater } from './AppWithContextUpdater';

interface AppRouterProps {
  session: Session | null;
  skipAuthCheck: boolean;
}

export const AppRouter: React.FC<AppRouterProps> = ({ session, skipAuthCheck }) => {
  const isAuthenticated = session || skipAuthCheck;

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <InstallAppPrompt />
        <Routes>
          <Route
            path="/"
            element={
              <AppWithContextUpdater>
                <Index />
              </AppWithContextUpdater>
            }
          />
          <Route
            path="/catalog"
            element={
              <AppWithContextUpdater>
                <Catalog />
              </AppWithContextUpdater>
            }
          />
          <Route
            path="/manage"
            element={isAuthenticated ? 
              <AppWithContextUpdater>
                <Manage />
              </AppWithContextUpdater> : 
              <Navigate to="/auth" />
            }
          />
          <Route
            path="/profile"
            element={isAuthenticated ? 
              <AppWithContextUpdater>
                <Profile />
              </AppWithContextUpdater> : 
              <Navigate to="/auth" />
            }
          />
          <Route
            path="/admin"
            element={isAuthenticated ? 
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
  );
};
