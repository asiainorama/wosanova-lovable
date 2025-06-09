
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAdminSession from '@/hooks/useAdminSession';

interface SidebarFooterProps {
  onClose?: () => void;
}

const SidebarFooter = ({ onClose }: SidebarFooterProps) => {
  const { isAdmin, loading } = useAdminSession();

  return (
    <div className="flex items-center justify-center w-full px-4 text-xs text-muted-foreground relative">
      <div>© {new Date().getFullYear()} WosaNova</div>
      
      {/* Admin icon in the right corner - SOLO para admins verificados */}
      {!loading && isAdmin && (
        <div className="absolute right-4">
          <Link to="/admin" onClick={onClose}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-gray-700/50 
                       backdrop-blur-sm transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
