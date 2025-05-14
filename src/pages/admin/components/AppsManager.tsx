
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppData } from "@/data/types";
import AppsTable from "@/components/admin/AppsTable";
import { 
  deleteAppFromSupabase, 
  deleteAllAppsFromSupabase,
  saveAppToSupabase 
} from "@/services/AppsService";
import { exportAppsToExcel, importAppsFromExcel } from "@/services/ExportService";
import { FileDown, FileUp, Plus, Trash2 } from "lucide-react";
import AlertDialogComponent from "@/components/ui/AlertDialogComponent";
import { toast } from "sonner";

interface AppsManagerProps {
  apps: AppData[];
  onAdd: () => void;
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
  onReloadApps: () => Promise<void>;
}

const AppsManager = ({ 
  apps, 
  onAdd, 
  onEdit, 
  onDelete,
  onReloadApps
}: AppsManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteApp = async (appId: string) => {
    try {
      await deleteAppFromSupabase(appId);
      onDelete(appId);
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
      await onReloadApps();
      toast.success("Todas las aplicaciones han sido eliminadas");
    } catch (error) {
      console.error("Error deleting all apps:", error);
      toast.error("Error al eliminar todas las aplicaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const importedApps = await importAppsFromExcel(file);

        for (const app of importedApps) {
          await saveAppToSupabase(app);
        }

        await onReloadApps();
        toast.success(`${importedApps.length} aplicaciones importadas correctamente`);
      } catch (error) {
        console.error("Error importing apps:", error);
        toast.error(`Error al importar aplicaciones: ${error}`);
      } finally {
        setLoading(false);
      }
    }

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

          <AlertDialogComponent onConfirm={handleDeleteAllApps}>
            <Button
              variant="destructive"
              className="flex items-center justify-center rounded-xl"
              size="icon"
              title="Eliminar todo el catálogo"
              disabled={loading}
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
            disabled={loading}
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => exportAppsToExcel(apps, "admin-apps-export")}
            className="flex items-center justify-center rounded-xl"
            size="icon"
            title="Exportar Excel"
            disabled={loading}
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            onClick={onAdd}
            size="icon"
            className="flex items-center justify-center rounded-xl"
            title="Añadir Nueva Aplicación"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AppsTable 
        apps={apps} 
        onEdit={onEdit} 
        onDelete={handleDeleteApp} 
      />
    </div>
  );
};

export default AppsManager;
