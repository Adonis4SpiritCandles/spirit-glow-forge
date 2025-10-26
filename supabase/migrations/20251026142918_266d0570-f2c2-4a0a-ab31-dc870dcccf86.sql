-- Add deleted_at column for soft delete functionality
ALTER TABLE public.orders 
ADD COLUMN deleted_at timestamp with time zone;

-- Create index for faster queries on deleted orders
CREATE INDEX idx_orders_deleted_at ON public.orders(deleted_at);

-- Add comment
COMMENT ON COLUMN public.orders.deleted_at IS 'Timestamp when order was soft deleted. NULL means order is active.';