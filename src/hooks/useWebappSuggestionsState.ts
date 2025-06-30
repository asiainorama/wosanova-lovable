
import { useState } from 'react';
import { WebappSuggestion } from '@/services/WebappSuggestionsService';

export const useWebappSuggestionsState = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WebappSuggestion>>({});
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

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

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingId(null);
    setEditForm({});
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

  return {
    editingId,
    editForm,
    publishingIds,
    savingIds,
    setPublishingIds,
    setSavingIds,
    handleEdit,
    handleCancelEdit,
    handleEditFormChange,
    setEditingId,
    setEditForm
  };
};
