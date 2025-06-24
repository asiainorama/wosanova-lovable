
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  fetchWebappSuggestions, 
  updateWebappSuggestion, 
  publishWebappSuggestion, 
  discardWebappSuggestion,
  runWebappSuggestionsProcess,
  WebappSuggestion 
} from '@/services/WebappSuggestionsService';
import { CheckCircle, XCircle, Edit2, Play, RefreshCw, AlertCircle } from 'lucide-react';

const CATEGORIAS = [
  'productividad', 'creatividad', 'educacion', 'entretenimiento', 
  'herramientas dev', 'negocio', 'otras'
];

const WebappSuggestionsTable: React.FC = () => {
  const [suggestions, setSuggestions] = useState<WebappSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WebappSuggestion>>({});
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await fetchWebappSuggestions();
      setSuggestions(data);
      console.log('Loaded suggestions:', data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Error al cargar sugerencias');
    } finally {
      setLoading(false);
    }
  };

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
        
        // Recargar sugerencias después de un breve delay
        setTimeout(() => {
          loadSuggestions();
        }, 1000);
      } else {
        toast.error('Error en el proceso de sugerencias');
      }
    } catch (error) {
      console.error('Error running process:', error);
      toast.error('Error al ejecutar el proceso de sugerencias');
      setProcessResult({ success: false, error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (suggestion: WebappSuggestion) => {
    setEditingId(suggestion.id);
    setEditForm({
      nombre: suggestion.nombre,
      url: suggestion.url,
      descripcion: suggestion.descripcion,
      categoria: suggestion.categoria,
      usa_ia: suggestion.usa_ia,
      etiquetas: suggestion.etiquetas
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateWebappSuggestion(editingId, editForm);
      toast.success('Sugerencia actualizada');
      setEditingId(null);
      setEditForm({});
      await loadSuggestions();
    } catch (error) {
      toast.error('Error al actualizar sugerencia');
    }
  };

  const handlePublish = async (suggestion: WebappSuggestion) => {
    try {
      await publishWebappSuggestion(suggestion);
      toast.success(`"${suggestion.nombre}" publicada en el catálogo`);
      await loadSuggestions();
    } catch (error) {
      toast.error('Error al publicar sugerencia');
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await discardWebappSuggestion(id);
      toast.success('Sugerencia descartada');
      await loadSuggestions();
    } catch (error) {
      toast.error('Error al descartar sugerencia');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sugerencias de Webapps</h2>
        <Button 
          onClick={handleRunProcess} 
          disabled={processing}
          className="flex items-center gap-2"
        >
          {processing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {processing ? 'Procesando...' : 'Ejecutar Proceso'}
        </Button>
      </div>

      {/* Mostrar resultado del proceso */}
      {processResult && (
        <Card className={`border ${processResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {processResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {processResult.success ? 'Proceso completado exitosamente' : 'Error en el proceso'}
                </p>
                {processResult.success ? (
                  <p className="text-sm text-gray-600">
                    Procesados: {processResult.processed} | Guardados: {processResult.saved}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    {processResult.error || 'Error desconocido en el proceso'}
                  </p>
                )}
                {processResult.debug && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer">Ver detalles</summary>
                    <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">
                      {JSON.stringify(processResult.debug, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No hay sugerencias pendientes</p>
            <p className="text-sm text-gray-400 mt-2">
              Ejecuta el proceso automático para generar nuevas sugerencias
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {suggestion.icono_url && (
                      <img 
                        src={suggestion.icono_url} 
                        alt={suggestion.nombre}
                        className="w-10 h-10 rounded"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                    <div>
                      {editingId === suggestion.id ? (
                        <Input
                          value={editForm.nombre || ''}
                          onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                          className="font-semibold"
                        />
                      ) : (
                        <CardTitle className="text-lg">{suggestion.nombre}</CardTitle>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingId === suggestion.id ? (
                      <>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(suggestion)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handlePublish(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDiscard(suggestion.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingId === suggestion.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        value={editForm.url || ''}
                        onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Descripción</label>
                      <Textarea
                        value={editForm.descripcion || ''}
                        onChange={(e) => setEditForm({...editForm, descripcion: e.target.value})}
                        maxLength={200}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Categoría</label>
                        <Select 
                          value={editForm.categoria || ''} 
                          onValueChange={(value) => setEditForm({...editForm, categoria: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={editForm.usa_ia || false}
                          onChange={(e) => setEditForm({...editForm, usa_ia: e.target.checked})}
                          id={`ai-${suggestion.id}`}
                        />
                        <label htmlFor={`ai-${suggestion.id}`} className="text-sm">Usa IA</label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{suggestion.descripcion}</p>
                    
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
          ))}
        </div>
      )}
    </div>
  );
};

export default WebappSuggestionsTable;
