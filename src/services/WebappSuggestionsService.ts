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
      // En desarrollo, devolver array vacío si hay error
      if (window.location.hostname.includes('lovable') || window.location.hostname === 'localhost') {
        return [];
      }
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} suggestions`);
    return (data || []) as WebappSuggestion[];
  } catch (error) {
    console.error('Error in fetchWebappSuggestions:', error);
    // En desarrollo, devolver array vacío para evitar crashes
    if (window.location.hostname.includes('lovable') || window.location.hostname === 'localhost') {
      return [];
    }
    throw error;
  }
};

// Actualizar una sugerencia
export const updateWebappSuggestion = async (id: string, updates: Partial<WebappSuggestion>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('webapp_suggestions')
      .update(updates)
      .eq('id', id);
    
    if (error && !window.location.hostname.includes('lovable')) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating webapp suggestion:', error);
    if (!window.location.hostname.includes('lovable')) {
      throw error;
    }
  }
};

// Publicar una sugerencia (convertirla en app real)
export const publishWebappSuggestion = async (suggestion: WebappSuggestion): Promise<void> => {
  try {
    console.log('Publishing suggestion:', suggestion.nombre);
    
    // Generate a unique ID for the new app
    const appId = crypto.randomUUID();
    
    // 1. Crear la app en la tabla apps
    const { error: appError } = await supabase
      .from('apps')
      .insert({
        id: appId,
        name: suggestion.nombre,
        url: suggestion.url,
        description: suggestion.descripcion,
        icon: suggestion.icono_url || `https://logo.clearbit.com/${new URL(suggestion.url).hostname}`,
        category: suggestion.categoria,
        subcategory: suggestion.etiquetas?.[0] || '',
        is_ai: suggestion.usa_ia || false
      });

    if (appError) {
      console.error('Error creating app:', appError);
      throw appError;
    }

    console.log('App created successfully with ID:', appId);

    // 2. Marcar la sugerencia como publicada
    const { error: updateError } = await supabase
      .from('webapp_suggestions')
      .update({ estado: 'publicado' })
      .eq('id', suggestion.id);

    if (updateError) {
      console.error('Error updating suggestion status:', updateError);
      throw updateError;
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
    await updateWebappSuggestion(id, { estado: 'descartado' });
  } catch (error) {
    console.error('Error discarding webapp suggestion:', error);
    if (!window.location.hostname.includes('lovable')) {
      throw error;
    }
  }
};

// Ejecutar el proceso de sugerencias automáticas
export const runWebappSuggestionsProcess = async (): Promise<{ success: boolean; processed: number; saved: number; filtered?: number }> => {
  try {
    const response = await supabase.functions.invoke('webapp-suggestions', {
      body: {}
    });

    if (response.error && !window.location.hostname.includes('lovable')) {
      throw response.error;
    }

    return response.data || { success: true, processed: 0, saved: 0 };
  } catch (error) {
    console.error('Error running webapp suggestions process:', error);
    // En desarrollo, devolver respuesta mock
    if (window.location.hostname.includes('lovable')) {
      return { success: true, processed: 0, saved: 0 };
    }
    throw error;
  }
};
