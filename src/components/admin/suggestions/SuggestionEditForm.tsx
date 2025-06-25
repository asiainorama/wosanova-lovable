
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WebappSuggestion } from '@/services/WebappSuggestionsService';
import { mainCategories } from '@/data/mainCategories';

interface SuggestionEditFormProps {
  editForm: Partial<WebappSuggestion>;
  onFormChange: (updates: Partial<WebappSuggestion>) => void;
  suggestionId: string;
}

const SuggestionEditForm: React.FC<SuggestionEditFormProps> = ({
  editForm,
  onFormChange,
  suggestionId
}) => {
  const handleCategoryChange = (value: string) => {
    console.log('Category selected:', value);
    console.log('Available categories:', mainCategories);
    onFormChange({ categoria: value });
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    console.log('Tags updated:', tags);
    onFormChange({ etiquetas: tags });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre</label>
          <Input
            value={editForm.nombre || ''}
            onChange={(e) => onFormChange({ nombre: e.target.value })}
            placeholder="Nombre de la aplicación"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Categoría *</label>
          <Select 
            value={editForm.categoria || ''} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {mainCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!editForm.categoria && (
            <p className="text-xs text-red-500 mt-1">La categoría es obligatoria para aprobar</p>
          )}
          {editForm.categoria && (
            <p className="text-xs text-green-600 mt-1">Categoría seleccionada: {editForm.categoria}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">URL</label>
        <Input
          value={editForm.url || ''}
          onChange={(e) => onFormChange({ url: e.target.value })}
          placeholder="https://ejemplo.com"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">URL del Icono</label>
        <Input
          value={editForm.icono_url || ''}
          onChange={(e) => onFormChange({ icono_url: e.target.value })}
          placeholder="https://ejemplo.com/icon.png"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Descripción</label>
        <Textarea
          value={editForm.descripcion || ''}
          onChange={(e) => onFormChange({ descripcion: e.target.value })}
          maxLength={200}
          rows={3}
          placeholder="Descripción de la aplicación"
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {(editForm.descripcion || '').length}/200
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Etiquetas</label>
        <Input
          value={editForm.etiquetas?.join(', ') || ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="etiqueta1, etiqueta2, etiqueta3"
        />
        <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editForm.usa_ia || false}
          onChange={(e) => onFormChange({ usa_ia: e.target.checked })}
          id={`ai-${suggestionId}`}
          className="h-4 w-4"
        />
        <label htmlFor={`ai-${suggestionId}`} className="text-sm font-medium">
          Usa Inteligencia Artificial
        </label>
      </div>
    </div>
  );
};

export default SuggestionEditForm;
