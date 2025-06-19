
import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';

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
      subcategory: app.subcategory || undefined, // Properly handle subcategory from database
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
        subcategory: app.subcategory || null, // Handle optional subcategory
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

// Nueva función para eliminar todas las aplicaciones
export const deleteAllAppsFromSupabase = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('apps')
      .delete()
      .neq('id', ''); // Delete all rows
    
    if (error) throw error;
    console.log('All apps deleted successfully');
  } catch (error) {
    console.error('Error deleting all apps from Supabase:', error);
    throw error;
  }
};
