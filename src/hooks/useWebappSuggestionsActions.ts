
import { toast } from 'sonner';
import { publishWebappSuggestion, discardWebappSuggestion, WebappSuggestion } from '@/services/WebappSuggestionsService';

export const useWebappSuggestionsActions = () => {
  const handlePublish = async (
    suggestion: WebappSuggestion,
    publishingIds: Set<string>,
    setPublishingIds: React.Dispatch<React.SetStateAction<Set<string>>>,
    refetch: () => void
  ) => {
    if (publishingIds.has(suggestion.id)) return;
    
    if (!suggestion.categoria || !suggestion.nombre || !suggestion.url || !suggestion.descripcion) {
      toast.error('Faltan campos obligatorios. Por favor, edita la sugerencia primero.');
      return;
    }
    
    try {
      setPublishingIds(prev => new Set(prev).add(suggestion.id));
      console.log('Publishing suggestion:', suggestion);
      
      await publishWebappSuggestion(suggestion);
      toast.success(`"${suggestion.nombre}" añadida al catálogo exitosamente`);
      
      setTimeout(async () => {
        await refetch();
        setPublishingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(suggestion.id);
          return newSet;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error publishing suggestion:', error);
      setPublishingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.id);
        return newSet;
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al publicar: ${errorMessage}`);
    }
  };

  const handleDiscard = async (id: string, refetch: () => void) => {
    try {
      await discardWebappSuggestion(id);
      toast.success('Sugerencia descartada');
      await refetch();
    } catch (error) {
      console.error('Error discarding suggestion:', error);
      toast.error('Error al descartar la sugerencia');
    }
  };

  return {
    handlePublish,
    handleDiscard
  };
};
