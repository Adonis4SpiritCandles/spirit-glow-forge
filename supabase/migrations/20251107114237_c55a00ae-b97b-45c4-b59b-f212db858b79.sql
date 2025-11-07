-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles_safe;

CREATE VIEW public.public_profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  first_name,
  last_name,
  username,
  profile_image_url,
  public_profile
FROM public.profiles
WHERE public_profile = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_profiles_safe TO anon;
GRANT SELECT ON public.public_profiles_safe TO authenticated;