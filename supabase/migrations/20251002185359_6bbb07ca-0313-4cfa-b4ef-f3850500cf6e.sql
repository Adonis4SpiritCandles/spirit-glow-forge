-- Add shipping fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS furgonetka_package_id text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS carrier text,
ADD COLUMN IF NOT EXISTS shipping_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_label_url text,
ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamp with time zone;

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- Create index for shipping status
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON public.orders(shipping_status);

-- Create table to store Furgonetka OAuth tokens
CREATE TABLE IF NOT EXISTS public.furgonetka_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on furgonetka_tokens (only admins can access)
ALTER TABLE public.furgonetka_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage tokens
CREATE POLICY "Admins can manage Furgonetka tokens"
ON public.furgonetka_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE TRIGGER update_furgonetka_tokens_updated_at
BEFORE UPDATE ON public.furgonetka_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();