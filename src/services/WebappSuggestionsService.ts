
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
    const { data, error } = await supabase
      .from('webapp_suggestions')
      .select('*')
      .eq('estado', 'borrador')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching webapp suggestions:', error);
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
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating webapp suggestion:', error);
    throw error;
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

    if (appError) throw appError;

    // 2. Marcar la sugerencia como publicada
    await updateWebappSuggestion(suggestion.id, { estado: 'publicado' });

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
    throw error;
  }
};

// Ejecutar el proceso de sugerencias automáticas
export const runWebappSuggestionsProcess = async (): Promise<{ success: boolean; processed: number; saved: number }> => {
  try {
    const response = await supabase.functions.invoke('webapp-suggestions', {
      body: {}
    });

    if (response.error) throw response.error;

    return response.data;
  } catch (error) {
    console.error('Error running webapp suggestions process:', error);
    throw error;
  }
};
