
import React from 'react';
import { X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SidebarHeaderProps {
  username: string | null;
  avatarUrl: string | null;
  userId: string | null;
  onClose: () => void;
}

const SidebarHeader = ({ username, avatarUrl, userId, onClose }: SidebarHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error al cerrar sesión');
        return;
      }

      console.log('Sign out successful');
      toast.success('Sesión cerrada correctamente');
      
      // Close sidebar and navigate to auth page
      onClose();
      navigate('/auth');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast.error('Error inesperado al cerrar sesión');
    }
  };

  const handleProfileClick = () => {
    onClose();
    
    // Si no hay usuario autenticado, redirigir al login
    if (!userId) {
      toast.info('Inicia sesión para acceder a tu perfil');
      navigate('/auth');
      return;
    }
    
    navigate('/profile');
  };

  const handleLoginClick = () => {
    onClose();
    navigate('/auth');
  };

  // Si no hay usuario autenticado, mostrar botón de login
  if (!userId) {
    return (
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center space-x-3">
          <button onClick={handleLoginClick} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                ?
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground truncate">
                Iniciar sesión
              </span>
            </div>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Close sidebar button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-gray-700/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-4">
      <div className="flex items-center space-x-3">
        <button onClick={handleProfileClick} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={username || 'Usuario'} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground truncate">
              {username || 'Usuario'}
            </span>
          </div>
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
        </Button>
        
        {/* Close sidebar button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-gray-700/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
