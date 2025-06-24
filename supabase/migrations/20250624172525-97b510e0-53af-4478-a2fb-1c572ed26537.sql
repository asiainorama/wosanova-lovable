
-- Primero eliminar la política que depende de la función
DROP POLICY IF EXISTS "Allow admin access to webapp suggestions" ON public.webapp_suggestions;

-- Ahora eliminar la función problemática
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Crear una función de seguridad corregida con search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- En modo desarrollo/preview, permitir acceso
  IF current_setting('request.jwt.claims', true) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el email del usuario es de administrador
  RETURN (
    auth.jwt() ->> 'email' LIKE '%@wosanova.com' 
    OR auth.jwt() ->> 'email' = 'asiainorama@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Crear nueva política usando la función corregida
CREATE POLICY "Allow admin access to webapp suggestions" 
  ON public.webapp_suggestions 
  FOR ALL 
  USING (public.is_admin_user());
