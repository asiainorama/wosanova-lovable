
-- Crear tabla para almacenar sugerencias de webapps
CREATE TABLE public.webapp_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono_url TEXT,
  usa_ia BOOLEAN DEFAULT FALSE,
  categoria TEXT NOT NULL,
  etiquetas TEXT[] DEFAULT '{}',
  estado TEXT NOT NULL DEFAULT 'borrador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_categoria CHECK (categoria IN ('productividad', 'creatividad', 'educacion', 'entretenimiento', 'herramientas dev', 'negocio', 'otras')),
  CONSTRAINT valid_estado CHECK (estado IN ('borrador', 'publicado', 'descartado'))
);

-- Agregar RLS (Row Level Security)
ALTER TABLE public.webapp_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para que solo administradores puedan ver y gestionar las sugerencias
CREATE POLICY "Admin can manage webapp suggestions" 
  ON public.webapp_suggestions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email LIKE '%@wosanova.com' 
        OR auth.users.email = 'asiainorama@gmail.com'
      )
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_webapp_suggestions_updated_at
  BEFORE UPDATE ON public.webapp_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.webapp_suggestions;
