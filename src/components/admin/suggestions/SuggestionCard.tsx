
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WebappSuggestion } from '@/services/WebappSuggestionsService';
import SuggestionActions from './SuggestionActions';
import SuggestionEditForm from './SuggestionEditForm';

interface SuggestionCardProps {
  suggestion: WebappSuggestion;
  editingId: string | null;
  editForm: Partial<WebappSuggestion>;
  publishingIds: Set<string>;
  savingIds: Set<string>;
  onEdit: (suggestion: WebappSuggestion) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPublish: (suggestion: WebappSuggestion) => void;
  onDiscard: (id: string) => void;
  onEditFormChange: (updates: Partial<WebappSuggestion>) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  editingId,
  editForm,
  publishingIds,
  savingIds,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onPublish,
  onDiscard,
  onEditFormChange
}) => {
  const isEditing = editingId === suggestion.id;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {suggestion.icono_url && (
              <img 
                src={suggestion.icono_url} 
                alt={suggestion.nombre}
                className="w-12 h-12 rounded object-contain flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{suggestion.nombre}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{suggestion.descripcion}</p>
            </div>
          </div>
          <SuggestionActions
            suggestion={suggestion}
            isEditing={isEditing}
            isPublishing={publishingIds.has(suggestion.id)}
            isSaving={savingIds.has(suggestion.id)}
            onEdit={() => onEdit(suggestion)}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onPublish={() => onPublish(suggestion)}
            onDiscard={() => onDiscard(suggestion.id)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <SuggestionEditForm
            editForm={editForm}
            onFormChange={onEditFormChange}
            suggestionId={suggestion.id}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span>🔗</span>
              <a href={suggestion.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {suggestion.url}
              </a>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{suggestion.categoria}</Badge>
              {suggestion.usa_ia && <Badge className="bg-purple-100 text-purple-800">IA</Badge>}
              {suggestion.etiquetas?.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
            
            <p className="text-xs text-gray-400">
              Creado: {new Date(suggestion.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;
