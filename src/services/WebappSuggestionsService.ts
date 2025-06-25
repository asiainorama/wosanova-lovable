
import { supabase } from '@/integrations/supabase/client';

export interface WebappSuggestion {
  id: string;
  nombre: string;
  url: string;
  descripcion: string;
  icono_url?: string;
  usa_ia?: boolean;
  categoria: string;
  etiquetas?: string[];
  estado: 'borrador' | 'publicado' | 'descartado';
  created_at: string;
  updated_at: string;
}

// Obtener todas las sugerencias en borrador
export const fetchWebappSuggestions = async (): Promise<WebappSuggestion[]> => {
  try {
    console.log('fetchWebappSuggestions: Starting request...');
    
    const { data, error } = await supabase
      .from('webapp_suggestions')
      .select('*')
      .eq('estado', 'borrador')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching suggestions:', error);
      if (window.location.hostname.includes('lovable') || window.location.hostname === 'localhost') {
        return [];
      }
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} suggestions`);
    return (data || []) as WebappSuggestion[];
  } catch (error) {
    console.error('Error in fetchWebappSuggestions:', error);
    if (window.location.hostname.includes('lovable') || window.location.hostname === 'localhost') {
      return [];
    }
    throw error;
  }
};

// Actualizar una sugerencia
export const updateWebappSuggestion = async (id: string, updates: Partial<WebappSuggestion>): Promise<void> => {
  try {
    console.log('Updating webapp suggestion:', id, updates);
    
    // Preparar los datos para la actualización
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Validar que la categoría esté presente si se está intentando actualizar
    if (updateData.categoria) {
      if (typeof updateData.categoria !== 'string') {
        throw new Error('La categoría debe ser una cadena de texto');
      }
      console.log('Updating with category:', updateData.categoria);
    }

    // Validar etiquetas
    if (updateData.etiquetas && !Array.isArray(updateData.etiquetas)) {
      throw new Error('Las etiquetas deben ser un array');
    }

    console.log('Final update data:', updateData);
    
    const { data, error } = await supabase
      .from('webapp_suggestions')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating webapp suggestion:', error);
      throw new Error(`Error al actualizar la sugerencia: ${error.message}`);
    }
    
    console.log('Webapp suggestion updated successfully:', data);
  } catch (error) {
    console.error('Error updating webapp suggestion:', error);
    throw error;
  }
};

// Publicar una sugerencia (convertirla en app real)
export const publishWebappSuggestion = async (suggestion: WebappSuggestion): Promise<void> => {
  try {
    console.log('Publishing suggestion:', suggestion.nombre, 'with category:', suggestion.categoria);
    
    // Validar datos obligatorios ANTES de continuar
    if (!suggestion.categoria || suggestion.categoria.trim() === '') {
      throw new Error('La categoría es obligatoria para publicar una sugerencia');
    }

    if (!suggestion.nombre || !suggestion.url || !suggestion.descripcion) {
      throw new Error('Nombre, URL y descripción son obligatorios');
    }
    
    // Generate a unique ID for the new app
    const appId = crypto.randomUUID();
    
    // Prepare app data for insertion - matching the exact database schema
    const appData = {
      id: appId,
      name: suggestion.nombre.trim(),
      url: suggestion.url.trim(),
      description: suggestion.descripcion.trim(),
      icon: suggestion.icono_url || `https://logo.clearbit.com/${new URL(suggestion.url).hostname}`,
      category: suggestion.categoria.trim(),
      subcategory: suggestion.etiquetas?.[0] || null,
      is_ai: suggestion.usa_ia || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('App data to insert:', appData);

    // 1. Crear la app en la tabla apps
    const { error: appError } = await supabase
      .from('apps')
      .insert(appData);

    if (appError) {
      console.error('Error creating app:', appError);
      throw new Error(`Error al crear la aplicación: ${appError.message}`);
    }

    console.log('App created successfully with ID:', appId);

    // 2. Marcar la sugerencia como publicada
    const { error: updateError } = await supabase
      .from('webapp_suggestions')
      .update({ 
        estado: 'publicado',
        updated_at: new Date().toISOString()
      })
      .eq('id', suggestion.id);

    if (updateError) {
      console.error('Error updating suggestion status:', updateError);
      throw new Error(`Error al actualizar el estado de la sugerencia: ${updateError.message}`);
    }

    console.log('Suggestion marked as published');

  } catch (error) {
    console.error('Error publishing webapp suggestion:', error);
    throw error;
  }
};

// Descartar una sugerencia
export const discardWebappSuggestion = async (id: string): Promise<void> => {
  try {
    console.log('Discarding webapp suggestion:', id);
    await updateWebappSuggestion(id, { estado: 'descartado' });
    console.log('Webapp suggestion discarded successfully');
  } catch (error) {
    console.error('Error discarding webapp suggestion:', error);
    throw error;
  }
};

// Ejecutar el proceso de sugerencias automáticas
export const runWebappSuggestionsProcess = async (): Promise<{ success: boolean; processed: number; saved: number; filtered?: number }> => {
  try {
    console.log('Starting webapp suggestions process...');
    
    // Verificar que tenemos la API key
    const hasApiKey = localStorage.getItem('groq_api_key_configured') === 'true';
    if (!hasApiKey) {
      throw new Error('API key de Groq no configurada. Por favor configura tu API key primero.');
    }
    
    const response = await supabase.functions.invoke('webapp-suggestions', {
      body: {}
    });

    console.log('Webapp suggestions response:', response);

    if (response.error) {
      console.error('Error in webapp suggestions process:', response.error);
      if (!window.location.hostname.includes('lovable') && window.location.hostname !== 'localhost') {
        throw response.error;
      }
    }

    return response.data || { success: true, processed: 0, saved: 0 };
  } catch (error) {
    console.error('Error running webapp suggestions process:', error);
    if (window.location.hostname.includes('lovable') || window.location.hostname === 'localhost') {
      return { success: true, processed: 0, saved: 0 };
    }
    throw error;
  }
};
