
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppData } from "@/data/types";
import AppsManagement from "./AppsManagement";
import UsersManagement from "./UsersManagement";

interface AdminTabsProps {
  activeTab: string;
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

const TABS = {
  APPS: "apps",
  USERS: "users",
};

const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  apps,
  onAdd,
  onEdit,
  onDelete,
  onDeleteAll,
  onImport,
  fileInputRef,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value={TABS.APPS}>
        <AppsManagement
          apps={apps}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onDeleteAll={onDeleteAll}
          onImport={onImport}
          fileInputRef={fileInputRef}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </TabsContent>

      <TabsContent value={TABS.USERS}>
        <UsersManagement />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
