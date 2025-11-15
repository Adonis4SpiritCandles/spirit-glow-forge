-- ========================================
-- ADD EXTERNAL URL FIELDS FOR IMAGES
-- ========================================
-- Questa migration aggiunge campi per URL esterni delle immagini
-- in custom_candles_settings e about_settings, permettendo di usare
-- sia upload che URL esterni.

-- Add hero_image_url_external to custom_candles_settings
ALTER TABLE public.custom_candles_settings
ADD COLUMN IF NOT EXISTS hero_image_url_external text;

-- Add hero_image_url_external to about_settings
ALTER TABLE public.about_settings
ADD COLUMN IF NOT EXISTS hero_image_url_external text;

-- Comment for documentation
COMMENT ON COLUMN public.custom_candles_settings.hero_image_url_external IS
'External URL for hero image. If hero_image_url (uploaded) exists, it takes priority.';
COMMENT ON COLUMN public.about_settings.hero_image_url_external IS
'External URL for hero image. If hero_image_url (uploaded) exists, it takes priority.';

