
-- Fix is_admin_user() to properly validate admin instead of returning TRUE
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the email from the JWT
  user_email := (auth.jwt() ->> 'email');
  
  -- If no email in JWT, deny access
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is an admin
  RETURN (
    user_email LIKE '%@wosanova.com' 
    OR user_email = 'asiainorama@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';
