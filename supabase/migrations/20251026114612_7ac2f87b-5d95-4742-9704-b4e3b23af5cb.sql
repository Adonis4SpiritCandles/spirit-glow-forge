-- Add tracking_url column to orders table
ALTER TABLE public.orders
ADD COLUMN tracking_url text;