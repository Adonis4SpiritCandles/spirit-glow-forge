-- ========================================
-- ADD USE_SPECIFIC_META TO SEO_SETTINGS
-- ========================================
-- Questa migration aggiunge il campo use_specific_meta per controllare
-- se generare meta tags specifici dai dati prodotto/collezione oppure
-- usare i tag generici da product_default/collection_default

-- Add use_specific_meta column
ALTER TABLE public.seo_settings
ADD COLUMN IF NOT EXISTS use_specific_meta boolean DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN public.seo_settings.use_specific_meta IS
'Controls meta tag generation strategy for products/collections. When false (default), use generic tags from product_default/collection_default. When true, generate specific tags from actual product/collection data (name, description, image).';

