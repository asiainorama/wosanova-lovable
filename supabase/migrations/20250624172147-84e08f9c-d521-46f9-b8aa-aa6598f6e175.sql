
-- Eliminar la política problemática
DROP POLICY IF EXISTS "Admins can manage webapp suggestions" ON public.webapp_suggestions;

-- Crear una función de seguridad para verificar si el usuario es admin
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Crear nueva política usando la función
CREATE POLICY "Allow admin access to webapp suggestions" 
  ON public.webapp_suggestions 
  FOR ALL 
  USING (public.is_admin_user());
