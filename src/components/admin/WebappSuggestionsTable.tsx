
import React from 'react';
import { useWebappSuggestions } from '@/hooks/useWebappSuggestions';
import { useWebappSuggestionsState } from '@/hooks/useWebappSuggestionsState';
import { useWebappSuggestionsForm } from '@/hooks/useWebappSuggestionsForm';
import { useWebappSuggestionsProcess } from '@/hooks/useWebappSuggestionsProcess';
import { useWebappSuggestionsActions } from '@/hooks/useWebappSuggestionsActions';
import SuggestionsHeader from './suggestions/SuggestionsHeader';
import ProcessResultCard from './suggestions/ProcessResultCard';
import EmptyState from './suggestions/EmptyState';
import LoadingState from './suggestions/LoadingState';
import ErrorState from './suggestions/ErrorState';
import SuggestionCard from './suggestions/SuggestionCard';

const WebappSuggestionsTable: React.FC = () => {
  const { suggestions, loading, error, refetch } = useWebappSuggestions();
  const { processing, processResult, handleRunProcess } = useWebappSuggestionsProcess();
  const { handlePublish, handleDiscard } = useWebappSuggestionsActions();
  const { handleSaveEdit } = useWebappSuggestionsForm();
  
  const {
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
  } = useWebappSuggestionsState();

  const onRunProcess = () => handleRunProcess(refetch);
  
  const onSaveEdit = () => handleSaveEdit(
    editingId,
    editForm,
    setSavingIds,
    setEditingId,
    setEditForm,
    refetch
  );

  const onPublish = (suggestion: any) => handlePublish(
    suggestion,
    publishingIds,
    setPublishingIds,
    refetch
  );

  const onDiscard = (id: string) => handleDiscard(id, refetch);

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
        onRunProcess={onRunProcess}
      />

      {processResult && <ProcessResultCard result={processResult} />}

      {suggestions.length === 0 ? (
        <EmptyState processing={processing} onRunProcess={onRunProcess} />
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
              onSaveEdit={onSaveEdit}
              onCancelEdit={handleCancelEdit}
              onPublish={onPublish}
              onDiscard={onDiscard}
              onEditFormChange={handleEditFormChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WebappSuggestionsTable;
