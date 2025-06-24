
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
    if (!sessionLoading) {
      if (session && isAdmin) {
        loadApps();
      } else if (!sessionLoading && !isAdmin) {
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

  if (sessionLoading || (loading && !showForm)) {
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
