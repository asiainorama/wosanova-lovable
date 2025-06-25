
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Cargando sugerencias...</p>
      </div>
    </div>
  );
};

export default LoadingState;
