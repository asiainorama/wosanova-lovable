
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SearchInput from "./SearchInput";
import UserRow from "./UserRow";
import UsersTableHeader from "./UsersTableHeader";
import TablePagination from "./TablePagination";
import { useUsers } from "@/hooks/useUsers";

const UsersTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { mode } = useTheme();
  const { 
    users, 
    loginCounts, 
    loading, 
    currentPage, 
    setCurrentPage, 
    totalUsers, 
    usersPerPage 
  } = useUsers();

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const id = user.id.toLowerCase();
    
    return username.includes(query) || id.includes(query);
  });

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Usuarios ({totalUsers})</h2>
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar usuario..." 
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <UsersTableHeader />
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm">
                  Cargando usuarios...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  loginCount={loginCounts[user.id] || 0} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default UsersTable;
