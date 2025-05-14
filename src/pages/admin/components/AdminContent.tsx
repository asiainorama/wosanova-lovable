
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AppsManager from "./AppsManager";
import UsersManager from "./UsersManager";
import { AppData } from "@/data/types";

interface AdminContentProps {
  activeTab: string;
  apps: AppData[];
  onAdd: () => void;
  onEdit: (app: AppData) => void;
  onDelete: (appId: string) => void;
  onReloadApps: () => Promise<void>;
}

const AdminContent = ({ 
  activeTab, 
  apps, 
  onAdd, 
  onEdit, 
  onDelete,
  onReloadApps
}: AdminContentProps) => {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value="apps">
        <AppsManager
          apps={apps}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onReloadApps={onReloadApps}
        />
      </TabsContent>

      <TabsContent value="users">
        <UsersManager />
      </TabsContent>
    </Tabs>
  );
};

export default AdminContent;
