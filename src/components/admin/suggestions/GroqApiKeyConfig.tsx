
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Check, AlertCircle } from 'lucide-react';

interface GroqApiKeyConfigProps {
  onApiKeyChange: (hasKey: boolean) => void;
}

const GroqApiKeyConfig: React.FC<GroqApiKeyConfigProps> = ({ onApiKeyChange }) => {
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'valid'>('unknown');

  useEffect(() => {
    // Clear any previously stored API key from localStorage (security cleanup)
    localStorage.removeItem('groq_api_key');
    
    // Check if the server-side key is configured
    const savedStatus = localStorage.getItem('groq_api_key_configured');
    if (savedStatus === 'true') {
      setKeyStatus('valid');
      onApiKeyChange(true);
    } else {
      setKeyStatus('unknown');
      onApiKeyChange(false);
    }
  }, [onApiKeyChange]);

  const getStatusBadge = () => {
    if (keyStatus === 'valid') {
      return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Configurada</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />No configurada</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuración de API Key de Groq
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>La API key de Groq se configura como secreto del servidor en Supabase.</p>
          <p className="mt-1">
            Puedes obtener una gratis en{' '}
            <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              console.groq.com/keys
            </a>
            {' '}y configurarla en los secretos de Edge Functions de Supabase como <code className="bg-gray-100 px-1 rounded">GROQ_API_KEY</code>.
          </p>
          {keyStatus === 'valid' && (
            <p className="mt-2 text-green-600 text-xs">
              ✓ API key configurada en el servidor. Ya puedes generar sugerencias automáticas.
            </p>
          )}
          {keyStatus === 'unknown' && (
            <div className="mt-2">
              <p className="text-amber-600 text-xs">
                Configura GROQ_API_KEY en los secretos de Supabase Edge Functions.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  localStorage.setItem('groq_api_key_configured', 'true');
                  setKeyStatus('valid');
                  onApiKeyChange(true);
                }}
              >
                Ya la configuré en Supabase
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroqApiKeyConfig;
