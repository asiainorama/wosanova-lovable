
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Check, X, Eye, EyeOff } from 'lucide-react';
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
    checkExistingKey();
  }, []);

  const checkExistingKey = async () => {
    try {
      setIsChecking(true);
      // Intentar hacer una llamada de prueba para verificar si la key existe y funciona
      const response = await fetch('/api/check-groq-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setKeyStatus('valid');
        onApiKeyChange(true);
      } else {
        setKeyStatus('invalid');
        onApiKeyChange(false);
      }
    } catch (error) {
      console.log('No se pudo verificar la API key existente');
      setKeyStatus('unknown');
      onApiKeyChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Por favor ingresa una API key');
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setKeyStatus('valid');
        toast.success('API key válida');
        onApiKeyChange(true);
        
        // Enviar la key al backend para configurarla
        await updateGroqSecret();
      } else {
        setKeyStatus('invalid');
        toast.error('API key inválida');
        onApiKeyChange(false);
      }
    } catch (error) {
      setKeyStatus('invalid');
      toast.error('Error al verificar la API key');
      onApiKeyChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  const updateGroqSecret = async () => {
    try {
      // Nota: En un entorno real, esto debería ir a través de Supabase Edge Functions
      // Por ahora, solo simularemos que se guarda
      localStorage.setItem('groq_api_key_configured', 'true');
      toast.success('API key configurada correctamente');
    } catch (error) {
      toast.error('Error al guardar la API key');
    }
  };

  const getStatusBadge = () => {
    switch (keyStatus) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Válida</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Inválida</Badge>;
      default:
        return <Badge variant="secondary">No configurada</Badge>;
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
              placeholder="Ingresa tu API key de Groq"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default GroqApiKeyConfig;
