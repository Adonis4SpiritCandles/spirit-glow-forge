-- Add has_issue field to orders table for manual admin control
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS has_issue boolean DEFAULT false;

-- Add index for faster queries filtering by has_issue
CREATE INDEX IF NOT EXISTS idx_orders_has_issue ON public.orders(has_issue) WHERE has_issue = true;

-- Comment for documentation
COMMENT ON COLUMN public.orders.has_issue IS 'Manually set by admin to flag orders with issues that need attention';