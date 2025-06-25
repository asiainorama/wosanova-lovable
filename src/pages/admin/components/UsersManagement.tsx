
import React from "react";
import UsersTable from "@/components/admin/UsersTable";

const UsersManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <UsersTable />
    </div>
  );
};

export default UsersManagement;
