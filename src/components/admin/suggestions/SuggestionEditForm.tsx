
import React, { useState, useEffect } from 'react';
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
  // Estado local para la categoría
  const [localCategoria, setLocalCategoria] = useState<string>('');

  // Sincronizar estado local con editForm cuando cambie
  useEffect(() => {
    console.log('=== SYNC EFFECT ===');
    console.log('editForm.categoria changed to:', editForm.categoria);
    setLocalCategoria(editForm.categoria || '');
  }, [editForm.categoria]);

  const handleCategoryChange = (value: string) => {
    console.log('=== LOCAL CATEGORY CHANGE ===');
    console.log('New category value:', value);
    
    // Actualizar estado local primero
    setLocalCategoria(value);
    
    // Luego notificar al padre
    onFormChange({ categoria: value });
    
    console.log('Local categoria updated to:', value);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    onFormChange({ etiquetas: tags });
  };

  console.log('=== RENDER EDIT FORM ===');
  console.log('editForm.categoria:', editForm.categoria);
  console.log('localCategoria:', localCategoria);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre *</label>
          <Input
            value={editForm.nombre || ''}
            onChange={(e) => onFormChange({ nombre: e.target.value })}
            placeholder="Nombre de la aplicación"
          />
          {!editForm.nombre && (
            <p className="text-xs text-red-500 mt-1">El nombre es obligatorio</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Categoría *</label>
          <Select 
            value={localCategoria} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-50">
              {mainCategories.map(cat => (
                <SelectItem 
                  key={cat} 
                  value={cat}
                  className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer px-3 py-2"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!localCategoria && (
            <p className="text-xs text-red-500 mt-1">La categoría es obligatoria para aprobar</p>
          )}
          {localCategoria && (
            <p className="text-xs text-green-600 mt-1">Categoría seleccionada: {localCategoria}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">URL *</label>
        <Input
          value={editForm.url || ''}
          onChange={(e) => onFormChange({ url: e.target.value })}
          placeholder="https://ejemplo.com"
        />
        {!editForm.url && (
          <p className="text-xs text-red-500 mt-1">La URL es obligatoria</p>
        )}
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
        <label className="text-sm font-medium mb-2 block">Descripción *</label>
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
        {!editForm.descripcion && (
          <p className="text-xs text-red-500 mt-1">La descripción es obligatoria</p>
        )}
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
