
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
      const data = await fetchWebappSuggestions();
      setSuggestions(data);
    } catch (error: any) {
      console.error('Error loading suggestions:', error);
      setError(error.message || 'Error al cargar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();

    // Set up realtime subscription
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
          loadSuggestions(); // Reload suggestions on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    refetch: loadSuggestions
  };
};
