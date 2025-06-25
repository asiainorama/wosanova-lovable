
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play } from 'lucide-react';

interface SuggestionsHeaderProps {
  suggestionsCount: number;
  loading: boolean;
  processing: boolean;
  onRefresh: () => void;
  onRunProcess: () => void;
}

const SuggestionsHeader: React.FC<SuggestionsHeaderProps> = ({
  suggestionsCount,
  loading,
  processing,
  onRefresh,
  onRunProcess
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">Sugerencias de Webapps</h2>
        <p className="text-sm text-gray-600 mt-1">
          {suggestionsCount} sugerencias pendientes
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          onClick={onRunProcess} 
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
    </div>
  );
};

export default SuggestionsHeader;
