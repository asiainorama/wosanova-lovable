
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ProcessResultCardProps {
  result: {
    success: boolean;
    processed: number;
    saved: number;
    error?: string;
  };
}

const ProcessResultCard: React.FC<ProcessResultCardProps> = ({ result }) => {
  return (
    <Card className={`border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <p className="font-medium">
              {result.success ? 'Proceso completado exitosamente' : 'Error en el proceso'}
            </p>
            {result.success ? (
              <p className="text-sm text-gray-600">
                Procesados: {result.processed} | Guardados: {result.saved}
              </p>
            ) : (
              <p className="text-sm text-red-600">
                {result.error || 'Error desconocido en el proceso'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessResultCard;
