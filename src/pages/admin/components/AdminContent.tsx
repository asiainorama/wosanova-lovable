
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppData } from "@/data/types";
import AppsTable from "@/components/admin/AppsTable";
import UsersTable from "@/components/admin/UsersTable";
import WebappSuggestionsTable from "@/components/admin/WebappSuggestionsTable";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Plus, Trash2 } from "lucide-react";
import AlertDialogComponent from "@/components/ui/AlertDialogComponent";
import { exportAppsToExcel, importAppsFromExcel } from "@/services/ExportService";

interface AdminContentProps {
  activeTab: string;
  apps: AppData[];
  onAdd: () => void;
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
  onReloadApps: () => void;
}

const TABS = {
  APPS: "apps",
  USERS: "users",
  SUGGESTIONS: "suggestions",
};

const AdminContent: React.FC<AdminContentProps> = ({
  activeTab,
  apps,
  onAdd,
  onEdit,
  onDelete,
  onReloadApps,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDeleteAllApps = async () => {
    // Implement delete all apps logic here
    console.log("Delete all apps");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedApps = await importAppsFromExcel(file);
        console.log('Imported apps:', importedApps);
        onReloadApps();
      } catch (error) {
        console.error('Error importing apps:', error);
      }
    }

    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value={TABS.APPS}>
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
      </TabsContent>

      <TabsContent value={TABS.USERS}>
        <div>
          <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
          <UsersTable />
        </div>
      </TabsContent>

      <TabsContent value={TABS.SUGGESTIONS}>
        <WebappSuggestionsTable />
      </TabsContent>
    </Tabs>
  );
};

export default AdminContent;
