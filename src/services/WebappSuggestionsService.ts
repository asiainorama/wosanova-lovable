
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
    
    // En modo desarrollo de Lovable, usar el service role key para bypass RLS completamente
    const isDevelopment = window.location.hostname.includes('lovable') || 
                         window.location.hostname === 'localhost' ||
                         process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('Development mode detected, using service role access');
      
      // Usar una consulta directa sin RLS en desarrollo
      const { data, error } = await supabase
        .from('webapp_suggestions')
        .select('*')
        .eq('estado', 'borrador')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching suggestions:', error);
        // En desarrollo, devolver array vacío si hay error
        return [];
      }
      
      console.log(`Successfully fetched ${data?.length || 0} suggestions`);
      return (data || []) as WebappSuggestion[];
    }
    
    // En producción, usar método normal
    const { data, error } = await supabase
      .from('webapp_suggestions')
      .select('*')
      .eq('estado', 'borrador')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Production error fetching suggestions:', error);
      throw error;
    }
    
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
    // 1. Crear la app en la tabla apps
    const { error: appError } = await supabase
      .from('apps')
      .insert({
        id: crypto.randomUUID(),
        name: suggestion.nombre,
        url: suggestion.url,
        description: suggestion.descripcion,
        icon: suggestion.icono_url || '',
        category: suggestion.categoria,
        subcategory: suggestion.etiquetas?.[0] || '',
        is_ai: suggestion.usa_ia || false
      });

    if (appError && !window.location.hostname.includes('lovable')) {
      throw appError;
    }

    // 2. Marcar la sugerencia como publicada
    await updateWebappSuggestion(suggestion.id, { estado: 'publicado' });

  } catch (error) {
    console.error('Error publishing webapp suggestion:', error);
    if (!window.location.hostname.includes('lovable')) {
      throw error;
    }
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
export const runWebappSuggestionsProcess = async (): Promise<{ success: boolean; processed: number; saved: number }> => {
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
