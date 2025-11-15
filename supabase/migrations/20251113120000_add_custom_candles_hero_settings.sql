-- Add advanced hero image settings to custom_candles_settings
-- These settings control animation, fluorescent effect, image size, and parallax strength

ALTER TABLE public.custom_candles_settings
ADD COLUMN IF NOT EXISTS hero_animation_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_fluorescent_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_fluorescent_intensity integer DEFAULT 30 CHECK (hero_fluorescent_intensity >= 0 AND hero_fluorescent_intensity <= 100),
ADD COLUMN IF NOT EXISTS hero_image_size text DEFAULT 'medium' CHECK (hero_image_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS hero_parallax_strength integer DEFAULT 300 CHECK (hero_parallax_strength >= 0 AND hero_parallax_strength <= 500);

COMMENT ON COLUMN public.custom_candles_settings.hero_animation_enabled IS 'Enable/disable hero image animation';
COMMENT ON COLUMN public.custom_candles_settings.hero_fluorescent_enabled IS 'Enable/disable fluorescent glow effect around the hero image';
COMMENT ON COLUMN public.custom_candles_settings.hero_fluorescent_intensity IS 'Intensity of the fluorescent effect (0-100)';
COMMENT ON COLUMN public.custom_candles_settings.hero_image_size IS 'Size of the hero image (small, medium, large)';
COMMENT ON COLUMN public.custom_candles_settings.hero_parallax_strength IS 'Parallax scrolling strength (0-500)';

