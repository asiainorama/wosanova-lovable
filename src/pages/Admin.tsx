
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import AppsTable from "@/components/admin/AppsTable";
import AppForm from "@/components/admin/AppForm";
import { AppData } from "@/data/types";
import { saveAppToSupabase, deleteAppFromSupabase, fetchAppsFromSupabase } from "@/services/AppsService";

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);

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
    <AdminLayout>
      {showForm ? (
        <AppForm 
          app={editingApp} 
          onSave={handleSaveApp} 
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Administración de Aplicaciones</h1>
            <Button onClick={handleAddApp}>Añadir Nueva Aplicación</Button>
          </div>
          <AppsTable 
            apps={apps} 
            onEdit={handleEditApp} 
            onDelete={handleDeleteApp} 
          />
        </>
      )}
    </AdminLayout>
  );
};

export default Admin;
