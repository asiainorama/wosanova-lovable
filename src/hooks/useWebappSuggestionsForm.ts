
import { toast } from 'sonner';
import { updateWebappSuggestion, WebappSuggestion } from '@/services/WebappSuggestionsService';

export const useWebappSuggestionsForm = () => {
  const validateEditForm = (editForm: Partial<WebappSuggestion>): boolean => {
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

  const handleSaveEdit = async (
    editingId: string | null,
    editForm: Partial<WebappSuggestion>,
    setSavingIds: React.Dispatch<React.SetStateAction<Set<string>>>,
    setEditingId: (id: string | null) => void,
    setEditForm: (form: Partial<WebappSuggestion>) => void,
    refetch: () => void
  ) => {
    if (!editingId) return;

    console.log('=== SAVING EDIT - NEW APPROACH ===');
    console.log('EditingId:', editingId);
    console.log('Final editForm state:', editForm);
    console.log('Final categoria being saved:', editForm.categoria);

    if (!validateEditForm(editForm)) {
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

  return {
    validateEditForm,
    handleSaveEdit
  };
};
