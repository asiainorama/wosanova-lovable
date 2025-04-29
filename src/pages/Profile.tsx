
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSelector } from '@/components/ThemeSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Rocket, User, Trash2, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('avatarUrl') || '');

  // Get current user details
  const user = supabase.auth.getSession().then(({ data }) => data.session?.user);

  // Load user preferences from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
    
    const storedAvatarUrl = localStorage.getItem('avatarUrl');
    if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd add proper account deletion logic here
      await supabase.auth.signOut();
      toast.success('Cuenta eliminada correctamente');
      navigate('/auth');
    } catch (error: any) {
      toast.error('Error al eliminar la cuenta');
    }
  };

  const handleSaveProfile = () => {
    // Save user preferences to localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('avatarUrl', avatarUrl);
    
    toast.success('Perfil actualizado correctamente');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Go back to the previous page, or to catalog if we can't
    if (location.key === "default") {
      navigate("/catalog");
    } else {
      navigate(-1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Rocket size={24} /> Área Personal
          </DialogTitle>
          <DialogDescription>
            Gestiona tu perfil y preferencias de la aplicación
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/10">
                  <User size={36} />
                </AvatarFallback>
              </Avatar>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="picture" className="sr-only">Imagen de perfil</Label>
                <Input 
                  id="picture" 
                  type="url" 
                  placeholder="URL de la imagen" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input 
                  id="username" 
                  placeholder="Tu nombre" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1"
                />
              </div>
              
              <Button onClick={handleSaveProfile} className="w-full">
                Guardar cambios
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Theme Selector Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 dark:text-white">Preferencias de apariencia</h3>
            <ThemeSelector />
          </div>
          
          <Separator className="my-4" />
          
          {/* Actions Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="flex-1 flex items-center gap-2"
            >
              <LogOut size={16} />
              Cerrar sesión
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex-1 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar mi cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta
                    y todos tus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
