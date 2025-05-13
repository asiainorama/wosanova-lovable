
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

interface UserRowProps {
  user: Tables<"user_profiles">;
  loginCount: number;
}

const UserRow = ({ user, loginCount }: UserRowProps) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
        {user.id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {user.username || "Sin nombre"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={user.theme_mode === "dark" ? "outline" : "default"}>
          {user.theme_mode || "default"}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={user.language === "en" ? "outline" : "default"}>
          {user.language || "default"}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {loginCount || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
      </td>
    </tr>
  );
};

export default UserRow;
