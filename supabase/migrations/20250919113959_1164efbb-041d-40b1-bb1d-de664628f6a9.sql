-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;

-- Add index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create admin user function
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE username = 'Admin') THEN
        RETURN;
    END IF;
    
    -- Generate a UUID for admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert admin profile
    INSERT INTO public.profiles (user_id, username, email, first_name, last_name, role)
    VALUES (admin_user_id, 'Admin', 'admin@spiritofcandles.com', 'Admin', 'User', 'admin');
END;
$$;

-- Execute the function to create admin user
SELECT public.create_admin_user();

-- Update handle_new_user function to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, username)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;

-- Create function to find user by username or email
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id uuid, email TEXT, username TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.user_id, p.email, p.username, p.role
    FROM public.profiles p
    WHERE p.username = identifier OR p.email = identifier;
END;
$$;