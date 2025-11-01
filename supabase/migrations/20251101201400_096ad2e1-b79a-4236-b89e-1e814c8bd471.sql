-- Add new columns to products table for multiple images and summary descriptions
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS summary_en text,
ADD COLUMN IF NOT EXISTS summary_pl text;

COMMENT ON COLUMN public.products.image_urls IS 'Array of up to 4 additional product image URLs (optional)';
COMMENT ON COLUMN public.products.summary_en IS 'Short product description in English for cards and previews';
COMMENT ON COLUMN public.products.summary_pl IS 'Short product description in Polish for cards and previews';