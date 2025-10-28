-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_pl TEXT,
  percent_off NUMERIC CHECK (percent_off >= 0 AND percent_off <= 100),
  amount_off_pln NUMERIC CHECK (amount_off_pln >= 0),
  amount_off_eur NUMERIC CHECK (amount_off_eur >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  max_redemptions INTEGER,
  redemptions_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active coupons"
  ON public.coupons
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage all coupons"
  ON public.coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default WELCOME10 coupon
INSERT INTO public.coupons (code, description_en, description_pl, percent_off, active, per_user_limit)
VALUES ('WELCOME10', '10% off your first order', '10% rabatu na pierwsze zamówienie', 10, true, 1)
ON CONFLICT (code) DO NOTHING;