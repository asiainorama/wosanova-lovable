
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play } from 'lucide-react';

interface EmptyStateProps {
  processing: boolean;
  onRunProcess: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ processing, onRunProcess }) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500">No hay sugerencias pendientes</p>
        <p className="text-sm text-gray-400 mt-2">
          Ejecuta el proceso automático para generar nuevas sugerencias
        </p>
        <Button 
          onClick={onRunProcess} 
          disabled={processing}
          className="mt-4"
          variant="outline"
        >
          {processing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {processing ? 'Procesando...' : 'Generar Sugerencias'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
