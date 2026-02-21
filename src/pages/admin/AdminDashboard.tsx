
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import AdminLayout from "@/components/admin/AdminLayout";
import { AppData } from "@/data/types";
import { fetchAppsFromSupabase } from "@/services/AppsService";
import AppForm from "@/components/admin/AppForm";
import AdminTabs from "./components/AdminTabs";

const TABS = {
  APPS: "apps",
  USERS: "users",
  SUGGESTIONS: "suggestions",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>(TABS.APPS);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await loadApps();
    };

    initialize();
  }, [navigate]);

  const checkSession = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const { data: isAdminData, error } = await supabase.rpc('is_admin_user');
        const isAdminUser = !error && !!isAdminData;
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          toast.error("Acceso restringido a administradores");
          navigate("/");
        }
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadApps = async () => {
    try {
      setLoading(true);
      const appsData = await fetchAppsFromSupabase();
      setApps(appsData);
    } catch (error) {
      console.error("Error loading apps:", error);
      toast.error("Error al cargar aplicaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleAddApp = () => {
    setEditingApp(null);
    setShowForm(true);
  };

  const handleEditApp = (app: AppData) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleSaveApp = async (app: AppData) => {
    try {
      const { saveAppToSupabase } = await import("@/services/AppsService");
      await saveAppToSupabase(app);

      setApps((prevApps) =>
        editingApp
          ? prevApps.map((a) => (a.id === app.id ? app : a))
          : [...prevApps, app]
      );

      toast.success(
        editingApp
          ? `Aplicación "${app.name}" actualizada`
          : `Aplicación "${app.name}" añadida`
      );
      setShowForm(false);
    } catch (error) {
      console.error("Error saving app:", error);
      toast.error("Error al guardar la aplicación");
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      const { deleteAppFromSupabase } = await import("@/services/AppsService");
      await deleteAppFromSupabase(appId);
      setApps((prevApps) => prevApps.filter((app) => app.id !== appId));
      toast.success(`Aplicación eliminada correctamente`);
    } catch (error) {
      console.error("Error deleting app:", error);
      toast.error("Error al eliminar la aplicación");
    }
  };

  const handleDeleteAllApps = async () => {
    try {
      setLoading(true);
      const { deleteAllAppsFromSupabase } = await import("@/services/AppsService");
      await deleteAllAppsFromSupabase();
      setApps([]);
      toast.success("Todas las aplicaciones han sido eliminadas");
    } catch (error) {
      console.error("Error deleting all apps:", error);
      toast.error("Error al eliminar todas las aplicaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleImportApps = async (file: File) => {
    try {
      setLoading(true);
      const { importAppsFromExcel } = await import("@/services/ExportService");
      const { saveAppToSupabase } = await import("@/services/AppsService");
      
      const importedApps = await importAppsFromExcel(file);

      for (const app of importedApps) {
        await saveAppToSupabase(app);
      }

      await loadApps();
      toast.success(`${importedApps.length} aplicaciones importadas correctamente`);
    } catch (error) {
      console.error("Error importing apps:", error);
      toast.error(`Error al importar aplicaciones: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => setActiveTab(value);

  if (loading && !showForm) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title="Admin" />

      <main className="container mx-auto px-4 py-6 flex-1">
        <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {showForm ? (
            <AppForm 
              app={editingApp} 
              onSave={handleSaveApp} 
              onCancel={() => setShowForm(false)} 
            />
          ) : (
            <AdminTabs
              activeTab={activeTab}
              apps={apps}
              onAdd={handleAddApp}
              onEdit={handleEditApp}
              onDelete={handleDeleteApp}
              onDeleteAll={handleDeleteAllApps}
              onImport={handleImportApps}
              fileInputRef={fileInputRef}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </AdminLayout>
      </main>
    </div>
  );
};

export default AdminDashboard;
