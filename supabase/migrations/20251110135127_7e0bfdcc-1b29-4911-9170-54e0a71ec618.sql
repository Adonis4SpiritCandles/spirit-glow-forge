-- Add logo_transparent_bg column to header_settings table
ALTER TABLE public.header_settings 
ADD COLUMN IF NOT EXISTS logo_transparent_bg BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.header_settings.logo_transparent_bg IS 'Whether the logo should have a transparent background (default: true for PNG logos)';
