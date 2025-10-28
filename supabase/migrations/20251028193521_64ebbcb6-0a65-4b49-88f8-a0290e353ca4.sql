-- Add discount and coupon tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_pln numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_eur numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code text;