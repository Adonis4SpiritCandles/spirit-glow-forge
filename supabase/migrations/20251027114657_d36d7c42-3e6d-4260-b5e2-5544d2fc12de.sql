-- Add columns for statistics exclusion and admin notifications
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS exclude_from_stats boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_seen boolean DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exclude_from_stats boolean DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS exclude_from_stats boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_exclude_from_stats ON public.orders(exclude_from_stats);
CREATE INDEX IF NOT EXISTS idx_orders_admin_seen ON public.orders(admin_seen);

-- Enable realtime for orders table (for admin notifications)
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;