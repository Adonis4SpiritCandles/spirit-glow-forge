-- Set public_profile to true by default for all users

-- Update all existing profiles to have public_profile = true
UPDATE profiles 
SET public_profile = true 
WHERE public_profile IS NULL OR public_profile = false;

-- Set default value for new profiles
ALTER TABLE profiles 
ALTER COLUMN public_profile SET DEFAULT true;

-- Create trigger to ensure public_profile is always true for new users
CREATE OR REPLACE FUNCTION public.ensure_public_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.public_profile IS NULL THEN
    NEW.public_profile := true;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_profile_created_ensure_public ON public.profiles;

CREATE TRIGGER on_profile_created_ensure_public
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW 
EXECUTE FUNCTION public.ensure_public_profile();