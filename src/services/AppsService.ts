
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

// Configurar la tabla para cambios en tiempo real
const configureRealtimeChanges = async () => {
  try {
    await supabase.rpc('supabase_realtime', {
      table: 'apps',
      action: 'add',
      schema: 'public'
    });
    console.log('Configuración de tiempo real para apps activada');
  } catch (error) {
    console.error('Error configurando tiempo real:', error);
  }
};

// Intentar configurar las actualizaciones en tiempo real al cargar el módulo
configureRealtimeChanges();

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
