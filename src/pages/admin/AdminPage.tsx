
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { AppData } from "@/data/types";
import { fetchAppsFromSupabase } from "@/services/AppsService";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminSession from "@/hooks/useAdminSession";
import AppFormContainer from "./components/AppFormContainer";
import AdminContent from "./components/AdminContent";
import { shouldSkipAuth } from "@/utils/environmentUtils";

const TABS = {
  APPS: "apps",
  USERS: "users",
  SUGGESTIONS: "suggestions",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading: sessionLoading } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const [activeTab, setActiveTab] = useState<string>(TABS.APPS);

  useEffect(() => {
    console.log("AdminPage - Session check:", { session, isAdmin, sessionLoading });
    
    // Verificar inmediatamente si estamos en modo preview
    const skipAuth = shouldSkipAuth();
    console.log("Skip auth check:", skipAuth);
    
    if (skipAuth) {
      console.log("Preview mode detected - granting admin access immediately");
      toast.info("Modo preview: Acceso de administrador concedido", { duration: 3000 });
      loadApps();
      return;
    }
    
    if (!sessionLoading) {
      if (isAdmin) {
        console.log("User has admin access, loading apps...");
        loadApps();
      } else {
        console.log("User is not admin, redirecting...");
        toast.error("Acceso restringido a administradores");
        navigate("/");
      }
    }
  }, [session, isAdmin, sessionLoading, navigate]);

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

  const handleEdit = (app: AppData) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleAddApp = () => {
    setEditingApp(null);
    setShowForm(true);
  };

  const handleSaveApp = async (app: AppData) => {
    // Update apps state after save
    setApps((prevApps) =>
      editingApp
        ? prevApps.map((a) => (a.id === app.id ? app : a))
        : [...prevApps, app]
    );
    setShowForm(false);
  };

  const handleDeleteApp = async (appId: string) => {
    setApps((prevApps) => prevApps.filter((app) => app.id !== appId));
  };

  const handleTabChange = (value: string) => setActiveTab(value);

  // Mostrar loader mientras se verifica la sesión
  if (sessionLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso en preview/desarrollo o si es admin real
  const skipAuth = shouldSkipAuth();
  if (skipAuth) {
    // En modo preview, siempre permitir acceso
    console.log("Preview mode: allowing admin access");
  } else if (!session || !isAdmin) {
    return null; // Redirect handled in useEffect
  }

  // Mostrar loader mientras cargan las apps
  if (loading && !showForm) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title="Admin" />

      <main className="container mx-auto px-4 py-6 flex-1">
        <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {showForm ? (
            <AppFormContainer 
              app={editingApp} 
              onSave={handleSaveApp} 
              onCancel={() => setShowForm(false)} 
            />
          ) : (
            <AdminContent
              activeTab={activeTab}
              apps={apps}
              onAdd={handleAddApp}
              onEdit={handleEdit}
              onDelete={handleDeleteApp}
              onReloadApps={loadApps}
            />
          )}
        </AdminLayout>
      </main>
    </div>
  );
};

export default AdminPage;
