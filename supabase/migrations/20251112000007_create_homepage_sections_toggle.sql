-- ========================================
-- CREATE HOMEPAGE SECTIONS TOGGLE TABLE
-- ========================================
-- Questa migration crea la tabella homepage_sections_toggle per gestire
-- l'attivazione/disattivazione di tutte le sezioni della homepage.

CREATE TABLE IF NOT EXISTS public.homepage_sections_toggle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Section Toggles (default true to maintain current behavior)
  hero_section_active boolean DEFAULT true,
  hero_text_active boolean DEFAULT true,
  features_section_active boolean DEFAULT true,
  testimonials_section_active boolean DEFAULT true,
  newsletter_section_active boolean DEFAULT true,
  community_section_active boolean DEFAULT true,
  product_carousel_active boolean DEFAULT true,
  scent_journey_active boolean DEFAULT true,
  trust_badges_active boolean DEFAULT true,
  
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections_toggle ENABLE ROW LEVEL SECURITY;

-- Admin can manage section toggles
CREATE POLICY "Admins can manage homepage sections toggle"
ON public.homepage_sections_toggle FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view section toggles
CREATE POLICY "Everyone can view homepage sections toggle"
ON public.homepage_sections_toggle FOR SELECT
USING (true);

-- Insert default settings record with all sections active
INSERT INTO public.homepage_sections_toggle (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE public.homepage_sections_toggle IS 
'Stores toggle settings for all homepage sections (Hero, Features, Testimonials, Newsletter, Community, ProductCarousel, ScentJourney, TrustBadges).';

