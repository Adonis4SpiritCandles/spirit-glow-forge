-- Add email language preference to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_language_preference text DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.email_language_preference IS 'Preferred language for automated emails (en or pl)';