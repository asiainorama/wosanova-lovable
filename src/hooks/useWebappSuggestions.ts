
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchWebappSuggestions, WebappSuggestion } from '@/services/WebappSuggestionsService';

export const useWebappSuggestions = () => {
  const [suggestions, setSuggestions] = useState<WebappSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading webapp suggestions...');
      
      const data = await fetchWebappSuggestions();
      console.log('Loaded suggestions:', data);
      setSuggestions(data);
    } catch (error: any) {
      console.error('Error loading suggestions:', error);
      // En desarrollo de Lovable, no mostrar error, solo log
      if (window.location.hostname.includes('lovable')) {
        setSuggestions([]);
        setError(null);
      } else {
        setError(error.message || 'Error al cargar sugerencias');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
    
    // No configurar realtime en desarrollo para evitar problemas
    if (window.location.hostname.includes('lovable')) {
      return;
    }

    // Set up realtime subscription solo en producción
    try {
      const channel = supabase
        .channel('webapp-suggestions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'webapp_suggestions'
          },
          (payload) => {
            console.log('Webapp suggestions update:', payload);
            loadSuggestions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    refetch: loadSuggestions
  };
};
