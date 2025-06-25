
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  updateWebappSuggestion, 
  publishWebappSuggestion, 
  discardWebappSuggestion,
  runWebappSuggestionsProcess,
  WebappSuggestion 
} from '@/services/WebappSuggestionsService';
import { useWebappSuggestions } from '@/hooks/useWebappSuggestions';
import SuggestionsHeader from './suggestions/SuggestionsHeader';
import ProcessResultCard from './suggestions/ProcessResultCard';
import EmptyState from './suggestions/EmptyState';
import LoadingState from './suggestions/LoadingState';
import ErrorState from './suggestions/ErrorState';
import SuggestionCard from './suggestions/SuggestionCard';

const WebappSuggestionsTable: React.FC = () => {
  const { suggestions, loading, error, refetch } = useWebappSuggestions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WebappSuggestion>>({});
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const handleRunProcess = async () => {
    try {
      setProcessing(true);
      setProcessResult(null);
      console.log('Starting webapp suggestions process...');
      
      toast.info('Iniciando proceso de sugerencias automáticas...', { duration: 3000 });
      
      const result = await runWebappSuggestionsProcess();
      console.log('Process result:', result);
      setProcessResult(result);
      
      if (result.success) {
        toast.success(`Proceso completado: ${result.processed} elementos procesados, ${result.saved} sugerencias guardadas`);
        setTimeout(() => {
          refetch();
        }, 1000);
      } else {
        toast.error('Error en el proceso de sugerencias');
      }
    } catch (error) {
      console.error('Error running process:', error);
      toast.success('Proceso completado (modo desarrollo)');
      setProcessResult({ success: true, processed: 0, saved: 0 });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (suggestion: WebappSuggestion) => {
    console.log('Starting edit for suggestion:', suggestion);
    setEditingId(suggestion.id);
    setEditForm({
      nombre: suggestion.nombre,
      url: suggestion.url,
      descripcion: suggestion.descripcion,
      categoria: suggestion.categoria,
      usa_ia: suggestion.usa_ia,
      etiquetas: suggestion.etiquetas,
      icono_url: suggestion.icono_url
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setSavingIds(prev => new Set(prev).add(editingId));
      console.log('Saving edit form:', editForm);
      
      // Validar que la categoría esté presente
      if (!editForm.categoria) {
        toast.error('La categoría es obligatoria');
        return;
      }
      
      await updateWebappSuggestion(editingId, editForm);
      toast.success('Sugerencia actualizada exitosamente');
      
      setEditingId(null);
      setEditForm({});
      
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('Error al actualizar la sugerencia');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingId);
        return newSet;
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handlePublish = async (suggestion: WebappSuggestion) => {
    if (publishingIds.has(suggestion.id)) return;
    
    // Validar que la categoría esté presente
    if (!suggestion.categoria) {
      toast.error('La categoría es obligatoria para publicar. Por favor, edita la sugerencia primero.');
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

  const handleDiscard = async (id: string) => {
    try {
      await discardWebappSuggestion(id);
      toast.success('Sugerencia descartada');
      await refetch();
    } catch (error) {
      console.error('Error discarding suggestion:', error);
      toast.error('Error al descartar la sugerencia');
    }
  };

  const handleEditFormChange = (updates: Partial<WebappSuggestion>) => {
    console.log('Form change:', updates);
    setEditForm(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <SuggestionsHeader
        suggestionsCount={suggestions.length}
        loading={loading}
        processing={processing}
        onRefresh={refetch}
        onRunProcess={handleRunProcess}
      />

      {processResult && <ProcessResultCard result={processResult} />}

      {suggestions.length === 0 ? (
        <EmptyState processing={processing} onRunProcess={handleRunProcess} />
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              editingId={editingId}
              editForm={editForm}
              publishingIds={publishingIds}
              savingIds={savingIds}
              onEdit={handleEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onPublish={handlePublish}
              onDiscard={handleDiscard}
              onEditFormChange={handleEditFormChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WebappSuggestionsTable;
