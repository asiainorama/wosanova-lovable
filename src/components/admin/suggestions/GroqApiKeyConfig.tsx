
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GroqApiKeyConfigProps {
  onApiKeyChange: (hasKey: boolean) => void;
}

const GroqApiKeyConfig: React.FC<GroqApiKeyConfigProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  useEffect(() => {
    // Verificar si ya hay una key configurada
    const savedKey = localStorage.getItem('groq_api_key_configured');
    const actualKey = localStorage.getItem('groq_api_key');
    
    console.log('Checking saved API key status:', savedKey);
    console.log('Has actual key:', !!actualKey);
    
    if (savedKey === 'true' && actualKey) {
      setKeyStatus('valid');
      onApiKeyChange(true);
      setApiKey(actualKey);
    } else {
      setKeyStatus('unknown');
      onApiKeyChange(false);
      // Limpiar localStorage si está inconsistente
      localStorage.removeItem('groq_api_key_configured');
      localStorage.removeItem('groq_api_key');
    }
  }, [onApiKeyChange]);

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Por favor ingresa una API key');
      return;
    }

    if (apiKey.length < 40) {
      toast.error('La API key parece demasiado corta. Verifica que sea correcta.');
      return;
    }

    setIsChecking(true);
    try {
      console.log('Testing Groq API key with length:', apiKey.length);
      
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API test response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API test successful, models:', data.data?.length || 0);
        
        setKeyStatus('valid');
        toast.success('API key válida y configurada correctamente');
        onApiKeyChange(true);
        
        // Guardar la configuración localmente
        localStorage.setItem('groq_api_key_configured', 'true');
        localStorage.setItem('groq_api_key', apiKey);
        
        console.log('Groq API key configured successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API test failed:', response.status, errorData);
        
        setKeyStatus('invalid');
        toast.error('API key inválida o sin permisos. Verifica que sea correcta.');
        onApiKeyChange(false);
        localStorage.removeItem('groq_api_key_configured');
        localStorage.removeItem('groq_api_key');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setKeyStatus('invalid');
      toast.error('Error al verificar la API key. Revisa tu conexión a internet.');
      onApiKeyChange(false);
      localStorage.removeItem('groq_api_key_configured');
      localStorage.removeItem('groq_api_key');
    } finally {
      setIsChecking(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setKeyStatus('unknown');
    onApiKeyChange(false);
    localStorage.removeItem('groq_api_key_configured');
    localStorage.removeItem('groq_api_key');
    toast.info('API key eliminada');
  };

  const getStatusBadge = () => {
    switch (keyStatus) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Válida</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Inválida</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />No configurada</Badge>;
    }
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
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Ingresa tu API key de Groq (gsk_...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testApiKey()}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button 
            onClick={testApiKey} 
            disabled={isChecking || !apiKey.trim()}
          >
            {isChecking ? 'Verificando...' : 'Verificar'}
          </Button>
          {keyStatus === 'valid' && (
            <Button 
              variant="outline"
              onClick={clearApiKey}
            >
              Limpiar
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Necesitas una API key de Groq para generar sugerencias automáticas.</p>
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
          </p>
          {keyStatus === 'valid' && (
            <p className="mt-2 text-green-600 text-xs">
              ✓ API key configurada correctamente. Ya puedes generar sugerencias automáticas.
            </p>
          )}
          {keyStatus === 'invalid' && (
            <p className="mt-2 text-red-600 text-xs">
              ✗ API key inválida. Verifica que hayas copiado la key completa.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroqApiKeyConfig;
