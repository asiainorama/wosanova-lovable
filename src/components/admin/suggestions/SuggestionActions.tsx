
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit2, RefreshCw, Save, X } from 'lucide-react';
import { WebappSuggestion } from '@/services/WebappSuggestionsService';

interface SuggestionActionsProps {
  suggestion: WebappSuggestion;
  isEditing: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPublish: () => void;
  onDiscard: () => void;
}

const SuggestionActions: React.FC<SuggestionActionsProps> = ({
  isEditing,
  isPublishing,
  isSaving,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onPublish,
  onDiscard
}) => {
  if (isEditing) {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Button 
          size="sm" 
          onClick={onSaveEdit}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancelEdit}
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onEdit}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        onClick={onPublish}
        className="bg-green-600 hover:bg-green-700"
        disabled={isPublishing}
      >
        {isPublishing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={onDiscard}
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SuggestionActions;
