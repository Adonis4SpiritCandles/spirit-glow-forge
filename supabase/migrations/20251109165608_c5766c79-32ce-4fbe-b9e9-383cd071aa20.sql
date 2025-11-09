-- Create header_settings table for managing header customization
CREATE TABLE IF NOT EXISTS public.header_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT NOT NULL DEFAULT '/spirit-logo-transparent.png',
  logo_height TEXT NOT NULL DEFAULT 'h-12',
  show_search BOOLEAN NOT NULL DEFAULT true,
  show_wishlist BOOLEAN NOT NULL DEFAULT true,
  show_cart BOOLEAN NOT NULL DEFAULT true,
  show_language_toggle BOOLEAN NOT NULL DEFAULT true,
  sticky_header BOOLEAN NOT NULL DEFAULT true,
  transparent_on_scroll BOOLEAN NOT NULL DEFAULT false,
  navigation_items JSONB NOT NULL DEFAULT '[
    {"label_en": "Shop", "label_pl": "Sklep", "url": "/shop", "order": 1, "is_active": true},
    {"label_en": "Collections", "label_pl": "Kolekcje", "url": "/collections", "order": 2, "is_active": true},
    {"label_en": "Custom Candles", "label_pl": "Własne Świece", "url": "/custom-candles", "order": 3, "is_active": true},
    {"label_en": "About", "label_pl": "O Nas", "url": "/about", "order": 4, "is_active": true}
  ]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.header_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view header settings"
  ON public.header_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage header settings"
  ON public.header_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO public.header_settings (id, logo_url, logo_height, show_search, show_wishlist, show_cart, show_language_toggle, sticky_header, transparent_on_scroll)
VALUES (gen_random_uuid(), '/spirit-logo-transparent.png', 'h-12', true, true, true, true, true, false);