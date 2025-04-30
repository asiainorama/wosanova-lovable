
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, Trash2, Save } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { mode, color, setMode, setColor } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setUsername(user.user_metadata?.username || '');
          setAvatar(user.user_metadata?.avatar_url || '');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setFormLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: username || undefined }
      });
      
      if (error) throw error;
      
      toast.success(t('profile.saved') || 'Perfil actualizado correctamente');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Placeholder for delete account functionality
    // This would typically involve API calls to delete user data
    toast.error('Función no implementada: Eliminar cuenta');
  };

  // Simplified layout with reduced height
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header title={t('profile.title') || "Área Personal"} />
      
      <main className="container mx-auto px-4 py-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar with user info */}
          <div className="md:col-span-1">
            <Card className="p-4 md:p-6 flex flex-col items-center md:items-start">
              <div className="flex flex-col items-center w-full mb-4">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={avatar} alt={username} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h2 className="font-bold text-lg dark:text-white">{username || t('profile.user') || 'Usuario'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex flex-col w-full gap-2">
                <Button 
                  onClick={handleLogout} 
                  disabled={loading} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('profile.logout') || 'Cerrar sesión'}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('profile.delete') || 'Eliminar mi cuenta'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('profile.delete.confirm') || '¿Estás seguro?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('profile.delete.description') || 
                          'Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos asociados.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('profile.cancel') || 'Cancelar'}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>{t('profile.delete') || 'Eliminar'}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2">
            <Card className="p-4 md:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="profile">{t('profile.account') || 'Cuenta'}</TabsTrigger>
                  <TabsTrigger value="appearance">{t('profile.appearance') || 'Apariencia'}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('profile.username') || 'Nombre de usuario'}</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('profile.username') || 'Nombre de usuario'}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={formLoading}
                    className="w-full sm:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {formLoading 
                      ? (t('profile.saving') || 'Guardando...') 
                      : (t('profile.save') || 'Guardar cambios')}
                  </Button>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  {/* Theme mode selection */}
                  <div className="space-y-2">
                    <Label>{t('profile.theme.mode') || 'Modo de apariencia'}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={mode === 'light' ? 'default' : 'outline'} 
                        className="justify-center"
                        onClick={() => setMode('light')}
                      >
                        {t('profile.theme.light') || 'Claro'}
                      </Button>
                      <Button 
                        variant={mode === 'dark' ? 'default' : 'outline'} 
                        className="justify-center"
                        onClick={() => setMode('dark')}
                      >
                        {t('profile.theme.dark') || 'Oscuro'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Language selection */}
                  <div className="space-y-2">
                    <Label>{t('profile.language') || 'Idioma'}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={language === 'es' ? 'default' : 'outline'} 
                        className="justify-center"
                        onClick={() => setLanguage('es')}
                      >
                        {t('profile.spanish') || 'Español'}
                      </Button>
                      <Button 
                        variant={language === 'en' ? 'default' : 'outline'} 
                        className="justify-center"
                        onClick={() => setLanguage('en')}
                      >
                        {t('profile.english') || 'Inglés'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Theme color selection */}
                  <div className="space-y-2">
                    <Label>{t('profile.theme.accent') || 'Color de acento'}</Label>
                    <RadioGroup value={color} onValueChange={(val) => setColor(val as any)}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blue" id="blue" />
                          <Label htmlFor="blue" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                            {t('profile.color.blue') || 'Azul'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="green" />
                          <Label htmlFor="green" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                            {t('profile.color.green') || 'Verde'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="red" id="red" />
                          <Label htmlFor="red" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            {t('profile.color.red') || 'Rojo'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pink" id="pink" />
                          <Label htmlFor="pink" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
                            {t('profile.color.pink') || 'Rosa'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="orange" id="orange" />
                          <Label htmlFor="orange" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                            {t('profile.color.orange') || 'Naranja'}
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gray" id="gray" />
                          <Label htmlFor="gray" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                            {t('profile.color.gray') || 'Gris'}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
