
-- Corregir función increment_login_count con search_path seguro
CREATE OR REPLACE FUNCTION public.increment_login_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Corregir función handle_new_user con search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, login_count, created_at, updated_at)
  VALUES (NEW.id, 0, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
