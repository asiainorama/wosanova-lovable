
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

const AdminLayout = ({ children, activeTab = "apps", onTabChange }: AdminLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleBackToSite = () => {
    navigate("/");
  };

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">WosaNova Admin</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBackToSite}>
              Volver al sitio
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Admin Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="apps">Aplicaciones</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {children}
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 dark:text-gray-400">
          Panel de Administración WosaNova &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
