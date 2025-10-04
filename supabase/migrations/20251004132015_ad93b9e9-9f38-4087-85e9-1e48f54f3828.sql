-- Convert product price columns to decimal with 2 digits
ALTER TABLE public.products
ALTER COLUMN price_pln TYPE numeric(10,2) USING price_pln::numeric,
ALTER COLUMN price_eur TYPE numeric(10,2) USING price_eur::numeric;

-- Add published flag to control visibility in shop
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- Optional: index for filtering by published
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (published);