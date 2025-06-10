
-- Create the get_all_users_for_admin function that returns user profile data for administrators
CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  avatar_url text,
  theme_mode text,
  language text,
  login_count integer,
  background_preference text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is an admin (you can adjust this logic based on your admin identification)
  -- For now, we'll check if the user email ends with @wosanova.com or is asiainorama@gmail.com
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.email LIKE '%@wosanova.com' 
      OR auth.users.email = 'asiainorama@gmail.com'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return all user profiles with email from auth.users
  RETURN QUERY
  SELECT 
    up.id,
    up.username,
    au.email::text,
    up.created_at,
    up.updated_at,
    up.avatar_url,
    up.theme_mode,
    up.language,
    up.login_count,
    up.background_preference
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.id = au.id
  ORDER BY up.created_at DESC;
END;
$$;
