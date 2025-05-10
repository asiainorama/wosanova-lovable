
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import AppsTable from "@/components/admin/AppsTable";
import AppForm from "@/components/admin/AppForm";
import { AppData } from "@/data/types";
import { saveAppToSupabase, deleteAppFromSupabase, fetchAppsFromSupabase } from "@/services/AppsService";
import { exportAppsToExcel, importAppsFromExcel } from "@/services/ExportService";
import { FileDown, FileUp, Plus } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user?.email) {
          // Check if user is admin (can be expanded with proper admin roles)
          // For now we're just checking if the email ends with wosanova.com
          const isAdminUser = data.session.user.email.endsWith("@wosanova.com") || 
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

    checkSession();
    loadApps();
  }, [navigate]);

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
      // Delete from Supabase
      await deleteAppFromSupabase(appId);
      
      // Update local state
      const updatedApps = apps.filter(app => app.id !== appId);
      setApps(updatedApps);
      
      toast.success(`Aplicación eliminada correctamente`);
    } catch (error) {
      console.error("Error deleting app:", error);
      toast.error("Error al eliminar la aplicación");
    }
  };

  const handleSaveApp = async (app: AppData) => {
    try {
      // Save to Supabase
      await saveAppToSupabase(app);
      
      // Update local state
      if (editingApp) {
        // Update existing app
        const updatedApps = apps.map(a => a.id === app.id ? app : a);
        setApps(updatedApps);
        toast.success(`Aplicación "${app.name}" actualizada`);
      } else {
        // Add new app
        setApps([...apps, app]);
        toast.success(`Aplicación "${app.name}" añadida`);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error("Error saving app:", error);
      toast.error("Error al guardar la aplicación");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingApp(null);
  };

  const handleExport = () => {
    exportAppsToExcel(apps, 'admin-apps-export');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const importedApps = await importAppsFromExcel(file);
      
      // Guardar cada app importada en Supabase
      for (const app of importedApps) {
        await saveAppToSupabase(app);
      }
      
      // Recargar apps
      await loadApps();
      toast.success(`${importedApps.length} aplicaciones importadas correctamente`);
    } catch (error) {
      console.error("Error importing apps:", error);
      toast.error(`Error al importar aplicaciones: ${error}`);
    } finally {
      setLoading(false);
      // Limpiar el input file
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title="Admin" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        {showForm ? (
          <AppForm 
            app={editingApp} 
            onSave={handleSaveApp} 
            onCancel={handleCancelForm}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Aplicaciones</h1>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleImportChange} 
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button 
                  variant="outline" 
                  onClick={handleImportClick} 
                  className="flex items-center justify-center" 
                  size="icon" 
                  title="Importar Excel"
                >
                  <FileUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExport} 
                  className="flex items-center justify-center" 
                  size="icon" 
                  title="Exportar Excel"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleAddApp} 
                  size="icon" 
                  className="flex items-center justify-center"
                  title="Añadir Nueva Aplicación"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AppsTable 
              apps={apps} 
              onEdit={handleEditApp} 
              onDelete={handleDeleteApp} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
