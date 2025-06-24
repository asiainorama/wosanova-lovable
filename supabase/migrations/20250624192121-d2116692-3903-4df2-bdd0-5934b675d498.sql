
-- Eliminar la política que depende de la función
DROP POLICY IF EXISTS "Allow admin access to webapp suggestions" ON public.webapp_suggestions;

-- Eliminar la función problemática
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Crear una función de seguridad que no acceda a auth.users directamente
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- En modo desarrollo/preview, permitir acceso
  IF current_setting('request.jwt.claims', true) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el email del usuario es de administrador usando auth.email()
  RETURN (
    auth.email() LIKE '%@wosanova.com' 
    OR auth.email() = 'asiainorama@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Recrear la política usando la función corregida
CREATE POLICY "Allow admin access to webapp suggestions" 
  ON public.webapp_suggestions 
  FOR ALL 
  USING (public.is_admin_user());
