
-- This function allows fetching auth user data safely from the client
CREATE OR REPLACE FUNCTION public.get_auth_users()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  calling_user_email text;
  is_admin boolean;
BEGIN
  -- Get the email of the calling user
  SELECT email INTO calling_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if the calling user is an admin
  SELECT 
    (calling_user_email LIKE '%@wosanova.com' OR calling_user_email = 'asiainorama@gmail.com') 
    INTO is_admin;
  
  -- Only return data if the user is an admin
  IF is_admin THEN
    RETURN QUERY
    SELECT 
      json_build_object(
        'id', u.id,
        'email', u.email,
        'last_sign_in_at', u.last_sign_in_at,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'login_count', (u.raw_app_meta_data->>'login_count')::int
      )
    FROM auth.users u;
  ELSE
    -- Return an empty set for non-admins
    RETURN;
  END IF;
END;
$$;

-- Grant access to this function for authenticated users
GRANT EXECUTE ON FUNCTION public.get_auth_users() TO authenticated;
