-- ========================================
-- CREATE HOMEPAGE COMMUNITY SETTINGS TABLE
-- ========================================
-- Questa migration crea la tabella homepage_community_settings per gestire
-- le impostazioni della sezione "Join Our Community" sulla homepage.

CREATE TABLE IF NOT EXISTS public.homepage_community_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Section Content
  title_en text DEFAULT 'Join Our Community',
  title_pl text DEFAULT 'Dołącz Do Społeczności',
  subtitle_en text DEFAULT 'See how our customers create magical ambiance with our candles',
  subtitle_pl text DEFAULT 'Zobacz jak nasi klienci tworzą magiczną atmosferę z naszymi świecami',
  
  -- Active Toggle
  is_active boolean DEFAULT true,
  
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_community_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage community settings
CREATE POLICY "Admins can manage homepage community settings"
ON public.homepage_community_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view active community settings
CREATE POLICY "Everyone can view active homepage community settings"
ON public.homepage_community_settings FOR SELECT
USING (is_active = true);

-- Insert default settings record
INSERT INTO public.homepage_community_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE public.homepage_community_settings IS 
'Stores settings for the "Join Our Community" section on the homepage including title, subtitle, and active toggle (EN/PL).';

