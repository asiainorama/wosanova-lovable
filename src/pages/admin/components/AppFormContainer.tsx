
import { AppData } from "@/data/types";
import AppForm from "@/components/admin/AppForm";
import { saveAppToSupabase } from "@/services/AppsService";
import { toast } from "sonner";

interface AppFormContainerProps {
  app: AppData | null;
  onSave: (app: AppData) => void;
  onCancel: () => void;
}

const AppFormContainer = ({ app, onSave, onCancel }: AppFormContainerProps) => {
  const handleSaveApp = async (app: AppData) => {
    try {
      // Save app to Supabase
      await saveAppToSupabase(app);
      
      toast.success(
        app.id && !app.id.startsWith("new-")
          ? `Aplicación "${app.name}" actualizada`
          : `Aplicación "${app.name}" añadida`
      );
      
      // Call parent onSave
      onSave(app);
    } catch (error) {
      console.error("Error saving app:", error);
      toast.error("Error al guardar la aplicación");
      throw error; // Re-throw to prevent form from closing
    }
  };

  return (
    <AppForm 
      app={app} 
      onSave={handleSaveApp} 
      onCancel={onCancel} 
    />
  );
};

export default AppFormContainer;
