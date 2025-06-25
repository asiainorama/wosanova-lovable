
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Plus, Trash2, Lightbulb } from "lucide-react";
import { AppData } from "@/data/types";
import AppsTable from "@/components/admin/AppsTable";
import AlertDialogComponent from "@/components/ui/AlertDialogComponent";
import { exportAppsToExcel } from "@/services/ExportService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuggestionsSection from "@/components/admin/suggestions/SuggestionsSection";

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
  const [activeTab, setActiveTab] = useState('catalog');

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);

    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Catálogo de Apps
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugerencias IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Catálogo de Aplicaciones</h2>
              <p className="text-gray-600">Gestiona las aplicaciones del catálogo principal</p>
            </div>
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
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppsManagement;
