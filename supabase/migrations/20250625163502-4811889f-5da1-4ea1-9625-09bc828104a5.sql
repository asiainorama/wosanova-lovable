
-- Eliminar TODAS las políticas existentes conflictivas de webapp_suggestions
DROP POLICY IF EXISTS "Allow admin access to webapp suggestions" ON public.webapp_suggestions;
DROP POLICY IF EXISTS "Admin can manage webapp suggestions" ON public.webapp_suggestions;
DROP POLICY IF EXISTS "Admins can manage webapp suggestions" ON public.webapp_suggestions;
DROP POLICY IF EXISTS "Allow all access to webapp suggestions" ON public.webapp_suggestions;

-- Crear UNA SOLA política limpia que use la función segura
CREATE POLICY "Admin access to webapp suggestions via function" 
  ON public.webapp_suggestions 
  FOR ALL 
  TO authenticated
  USING (public.is_admin_user());

-- Asegurar que RLS esté habilitado
ALTER TABLE public.webapp_suggestions ENABLE ROW LEVEL SECURITY;
