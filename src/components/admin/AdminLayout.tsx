
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const TABS = {
  APPS: "apps",
  USERS: "users",
  SUGGESTIONS: "suggestions",
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={TABS.APPS}>Apps</TabsTrigger>
          <TabsTrigger value={TABS.USERS}>Usuarios</TabsTrigger>
          <TabsTrigger value={TABS.SUGGESTIONS}>Sugerencias</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default AdminLayout;
