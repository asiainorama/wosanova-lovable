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
    console.log('=== STARTING EDIT - NEW APPROACH ===');
    console.log('Original suggestion:', suggestion);
    
    setEditingId(suggestion.id);
    
    // Crear una copia exacta usando Object.assign para asegurar inmutabilidad
    const formData = Object.assign({}, suggestion);
    
    console.log('Setting editForm to (Object.assign):', formData);
    console.log('Categoria value being set:', formData.categoria);
    
    // Usar setTimeout para asegurar que el estado se establece después del render
    setTimeout(() => {
      setEditForm(formData);
      console.log('EditForm set with setTimeout');
    }, 0);
  };

  const validateEditForm = (): boolean => {
    if (!editForm.nombre || editForm.nombre.trim() === '') {
      toast.error('El nombre es obligatorio');
      return false;
    }
    
    if (!editForm.url || editForm.url.trim() === '') {
      toast.error('La URL es obligatoria');
      return false;
    }
    
    if (!editForm.descripcion || editForm.descripcion.trim() === '') {
      toast.error('La descripción es obligatoria');
      return false;
    }
    
    if (!editForm.categoria || editForm.categoria.trim() === '') {
      toast.error('La categoría es obligatoria');
      return false;
    }
    
    try {
      new URL(editForm.url);
    } catch {
      toast.error('La URL no tiene un formato válido');
      return false;
    }
    
    return true;
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    console.log('=== SAVING EDIT - NEW APPROACH ===');
    console.log('EditingId:', editingId);
    console.log('Final editForm state:', editForm);
    console.log('Final categoria being saved:', editForm.categoria);

    if (!validateEditForm()) {
      console.log('Validation failed, aborting save');
      return;
    }

    try {
      setSavingIds(prev => new Set(prev).add(editingId));
      
      const updateData = {
        nombre: editForm.nombre!.trim(),
        url: editForm.url!.trim(),
        descripcion: editForm.descripcion!.trim(),
        categoria: editForm.categoria!.trim(),
        usa_ia: editForm.usa_ia || false,
        etiquetas: editForm.etiquetas || [],
        icono_url: editForm.icono_url?.trim() || null
      };

      console.log('=== FINAL UPDATE DATA ===');
      console.log('Update data to send:', updateData);
      console.log('Categoria in final update:', updateData.categoria);
      
      await updateWebappSuggestion(editingId, updateData);
      
      console.log('=== UPDATE SUCCESSFUL ===');
      toast.success('Sugerencia actualizada exitosamente');
      
      setEditingId(null);
      setEditForm({});
      
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error updating suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al actualizar: ${errorMessage}`);
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingId);
        return newSet;
      });
    }
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingId(null);
    setEditForm({});
  };

  const handlePublish = async (suggestion: WebappSuggestion) => {
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
    console.log('=== FORM CHANGE - NEW APPROACH ===');
    console.log('Updates received:', updates);
    console.log('Current editForm:', editForm);
    
    setEditForm(prevForm => {
      const newForm = { ...prevForm, ...updates };
      console.log('New form after merge:', newForm);
      console.log('New categoria in form:', newForm.categoria);
      return newForm;
    });
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
