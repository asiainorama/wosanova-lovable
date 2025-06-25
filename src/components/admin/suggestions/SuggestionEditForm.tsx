
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre</label>
          <Input
            value={editForm.nombre || ''}
            onChange={(e) => onFormChange({ ...editForm, nombre: e.target.value })}
            placeholder="Nombre de la aplicación"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Categoría</label>
          <Select 
            value={editForm.categoria || ''} 
            onValueChange={(value) => onFormChange({ ...editForm, categoria: value })}
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
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">URL</label>
        <Input
          value={editForm.url || ''}
          onChange={(e) => onFormChange({ ...editForm, url: e.target.value })}
          placeholder="https://ejemplo.com"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">URL del Icono</label>
        <Input
          value={editForm.icono_url || ''}
          onChange={(e) => onFormChange({ ...editForm, icono_url: e.target.value })}
          placeholder="https://ejemplo.com/icon.png"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Descripción</label>
        <Textarea
          value={editForm.descripcion || ''}
          onChange={(e) => onFormChange({ ...editForm, descripcion: e.target.value })}
          maxLength={200}
          rows={3}
          placeholder="Descripción de la aplicación"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editForm.usa_ia || false}
          onChange={(e) => onFormChange({ ...editForm, usa_ia: e.target.checked })}
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
