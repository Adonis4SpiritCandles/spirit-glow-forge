-- Add shipping cost and carrier name columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_cost_pln integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost_eur integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS carrier_name text;

-- Update existing orders to have zero shipping cost
UPDATE public.orders
SET shipping_cost_pln = 0, shipping_cost_eur = 0
WHERE shipping_cost_pln IS NULL OR shipping_cost_eur IS NULL;