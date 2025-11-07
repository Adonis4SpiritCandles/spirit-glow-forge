-- Create a safe public view for displaying profile information
-- This view only exposes non-sensitive data for public profiles
CREATE OR REPLACE VIEW public.public_profiles_safe AS
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

-- Update profile_comments policies to allow admin deletion
DROP POLICY IF EXISTS "Comments delete own or admin" ON public.profile_comments;
CREATE POLICY "Comments delete own or admin" 
ON public.profile_comments 
FOR DELETE 
TO authenticated
USING (
  (auth.uid() = commenter_id) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure all profile_comments policies are properly set
DROP POLICY IF EXISTS "Comments select visible" ON public.profile_comments;
CREATE POLICY "Comments select visible" 
ON public.profile_comments 
FOR SELECT 
TO authenticated
USING (is_visible = true);

DROP POLICY IF EXISTS "Comments insert authenticated" ON public.profile_comments;
CREATE POLICY "Comments insert authenticated" 
ON public.profile_comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = commenter_id);

DROP POLICY IF EXISTS "Comments update own" ON public.profile_comments;
CREATE POLICY "Comments update own" 
ON public.profile_comments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = commenter_id)
WITH CHECK (auth.uid() = commenter_id);