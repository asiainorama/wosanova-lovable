import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import AppsTable from "@/components/admin/AppsTable";
import UsersTable from "@/components/admin/UsersTable";
import AppForm from "@/components/admin/AppForm";
import { AppData } from "@/data/types";
import {
  saveAppToSupabase,
  deleteAppFromSupabase,
  fetchAppsFromSupabase,
  deleteAllAppsFromSupabase,
} from "@/services/AppsService";
import { exportAppsToExcel, importAppsFromExcel } from "@/services/ExportService";
import { FileDown, FileUp, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import AlertDialogComponent from "@/components/ui/AlertDialogComponent";

const TABS = {
  APPS: "apps",
  USERS: "users",
};

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>(TABS.APPS);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await loadApps();
    };

    initialize();
  }, [navigate]);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user?.email) {
        const isAdminUser =
          data.session.user.email.endsWith("@wosanova.com") ||
          data.session.user.email === "asiainorama@gmail.com";
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

  const handleDeleteApp = async (appId: string) => {
    try {
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

  const handleSaveApp = async (app: AppData) => {
    try {
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

  const handleImportApps = async (file: File) => {
    try {
      setLoading(true);
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
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title="Admin" />

      <main className="container mx-auto px-4 py-6 flex-1">
        <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {showForm ? (
            <AppForm app={editingApp} onSave={handleSaveApp} onCancel={() => setShowForm(false)} />
          ) : (
            <Tabs value={activeTab} className="w-full">
              <TabsContent value={TABS.APPS}>
                <AppManagement
                  apps={apps}
                  onAdd={handleAddApp}
                  onEdit={handleEditApp}
                  onDelete={handleDeleteApp}
                  onDeleteAll={handleDeleteAllApps}
                  onExport={() => exportAppsToExcel(apps, "admin-apps-export")}
                  onImport={(file) => handleImportApps(file)}
                  fileInputRef={fileInputRef}
                />
              </TabsContent>

              <TabsContent value={TABS.USERS}>
                <UserManagement />
              </TabsContent>
            </Tabs>
          )}
        </AdminLayout>
      </main>
    </div>
  );
};

const AppManagement = ({
  apps,
  onAdd,
  onEdit,
  onDelete,
  onDeleteAll,
  onExport,
  onImport,
  fileInputRef,
}) => {
  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);

    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apps</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportChange}
            className="hidden"
            ref={fileInputRef}
          />

          <AlertDialogComponent onConfirm={onDeleteAll}>
            <Button
              variant="destructive"
              className="flex items-center justify-center rounded-xl"
              size="icon"
              title="Eliminar todo el catálogo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogComponent>

          <Button
            variant="outline"
            onClick={handleImportClick}
            className="flex items-center justify-center rounded-xl"
            size="icon"
            title="Importar Excel"
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center justify-center rounded-xl"
            size="icon"
            title="Exportar Excel"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            onClick={onAdd}
            size="icon"
            className="flex items-center justify-center rounded-xl"
            title="Añadir Nueva Aplicación"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AppsTable apps={apps} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

const UserManagement = () => (
  <div>
    <h1 className="text-2xl font-bold">Usuarios</h1>
    <UsersTable />
  </div>
);

export default Admin;
