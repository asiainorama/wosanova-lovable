
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import GroqApiKeyConfig from './GroqApiKeyConfig';
import WebappSuggestionsTable from '../WebappSuggestionsTable';

const SuggestionsSection: React.FC = () => {
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugerencias Automáticas de Webapps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Genera automáticamente sugerencias de aplicaciones web usando IA. 
            Las sugerencias aparecerán como borradores que puedes revisar, editar y aprobar para añadirlas al catálogo.
          </p>
          
          <GroqApiKeyConfig onApiKeyChange={setHasValidApiKey} />
          
          {hasValidApiKey && <WebappSuggestionsTable />}
          
          {!hasValidApiKey && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Configura tu API key de Groq para comenzar a generar sugerencias automáticas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionsSection;
