
-- Agregar columna login_count a la tabla user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN login_count INTEGER DEFAULT 0;

-- Crear función para actualizar el contador de login
CREATE OR REPLACE FUNCTION public.increment_login_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar o actualizar el perfil del usuario
  INSERT INTO public.user_profiles (id, login_count, updated_at)
  VALUES (NEW.id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    login_count = COALESCE(user_profiles.login_count, 0) + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Crear trigger para incrementar contador en cada login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.increment_login_count();

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, login_count, created_at, updated_at)
  VALUES (NEW.id, 0, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar usuarios existentes que no están en user_profiles
INSERT INTO public.user_profiles (id, login_count, created_at, updated_at)
SELECT 
  au.id,
  0 as login_count,
  au.created_at,
  COALESCE(au.updated_at, au.created_at) as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
