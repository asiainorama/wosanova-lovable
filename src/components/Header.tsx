
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarMenu from './SidebarMenu';
import { supabase } from '@/integrations/supabase/client';
import TopBar from './TopBar';

interface HeaderProps {
  title?: string; // Made optional since we're removing title display
}

const Header: React.FC<HeaderProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkIfAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (session?.user?.email) {
        // Solo se considera administrador si el email es asiainorama@gmail.com o termina en @wosanova.com
        const isAdminUser = session.user.email.endsWith("@wosanova.com") || 
                          session.user.email === "asiainorama@gmail.com";
        setIsAdmin(isAdminUser);
      }
    };
    
    checkIfAdmin();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-background border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 h-[64px]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:flex dark:text-white dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Title has been removed */}
        </div>
        
        <TopBar isAdmin={isAdmin} />

        <SidebarMenu isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      </div>
    </header>
  );
};

export default React.memo(Header);
