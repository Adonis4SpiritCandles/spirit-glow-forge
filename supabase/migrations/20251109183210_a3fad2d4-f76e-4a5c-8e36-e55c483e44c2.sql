-- Fix cover_image_url sync by updating main sync function
-- Drop the separate cover image sync (no longer needed)
DROP TRIGGER IF EXISTS sync_cover_image_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_cover_image_to_directory();

-- Update main sync function to include cover_image_url
CREATE OR REPLACE FUNCTION public.sync_public_profile_directory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.public_profile_directory AS d (
    user_id, first_name, last_name, username, profile_image_url, cover_image_url, public_profile, updated_at, created_at
  ) VALUES (
    NEW.user_id, NEW.first_name, NEW.last_name, NEW.username, NEW.profile_image_url, NEW.cover_image_url, COALESCE(NEW.public_profile, true), NOW(), COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    username = EXCLUDED.username,
    profile_image_url = EXCLUDED.profile_image_url,
    cover_image_url = EXCLUDED.cover_image_url,
    public_profile = EXCLUDED.public_profile,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Backfill cover_image_url from profiles to public_profile_directory
UPDATE public.public_profile_directory d
SET cover_image_url = p.cover_image_url,
    updated_at = NOW()
FROM public.profiles p
WHERE d.user_id = p.user_id
  AND p.cover_image_url IS NOT NULL
  AND (d.cover_image_url IS NULL OR d.cover_image_url != p.cover_image_url);