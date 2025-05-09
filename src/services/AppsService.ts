
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

// Configurar la tabla para cambios en tiempo real
const configureRealtimeChanges = async () => {
  try {
    // Create a channel to listen for Postgres changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'apps'
        }, 
        (payload) => {
          console.log('Real-time update received for apps table:', payload);
        }
      )
      .subscribe();
    
    console.log('Configuración de tiempo real para apps activada');
    
    // Return the channel for potential cleanup
    return channel;
  } catch (error) {
    console.error('Error configurando tiempo real:', error);
  }
};

// Attempt to configure real-time updates when the module loads
const realtimeChannel = configureRealtimeChanges();

// Function to clean up real-time connection if needed
export const cleanupRealtimeConnection = async () => {
  if (realtimeChannel) {
    await supabase.removeChannel(await realtimeChannel);
  }
};

// Función para obtener todas las aplicaciones de Supabase
export const fetchAppsFromSupabase = async (): Promise<AppData[]> => {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*');
    
    if (error) throw error;
    
    // Mapear los datos de Supabase al formato AppData
    const apps: AppData[] = data.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      url: app.url,
      icon: app.icon,
      category: app.category,
      isAI: app.is_ai,
      created_at: app.created_at,
      updated_at: app.updated_at
    }));
    
    return apps;
  } catch (error) {
    console.error('Error fetching apps from Supabase:', error);
    throw error;
  }
};

// Función para guardar una aplicación en Supabase
export const saveAppToSupabase = async (app: AppData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('apps')
      .upsert({
        id: app.id,
        name: app.name,
        description: app.description,
        url: app.url,
        icon: app.icon,
        category: app.category,
        is_ai: app.isAI
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving app to Supabase:', error);
    throw error;
  }
};

// Función para eliminar una aplicación de Supabase
export const deleteAppFromSupabase = async (appId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', appId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting app from Supabase:', error);
    throw error;
  }
};
