
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Plus, Trash2 } from "lucide-react";
import { AppData } from "@/data/types";
import AppsTable from "@/components/admin/AppsTable";
import AlertDialogComponent from "@/components/ui/AlertDialogComponent";
import { exportAppsToExcel } from "@/services/ExportService";

interface AppsManagementProps {
  apps: AppData[];
  onAdd: () => void;
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
  onDeleteAll: () => void;
  onImport: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const AppsManagement: React.FC<AppsManagementProps> = ({
  apps,
  onAdd,
  onEdit,
  onDelete,
  onDeleteAll,
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
            onClick={() => exportAppsToExcel(apps, "admin-apps-export")}
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

export default AppsManagement;
