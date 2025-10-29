-- =====================================================
-- HOMEPAGE SETTINGS TABLES
-- =====================================================

-- 1. Hero Video Settings
CREATE TABLE IF NOT EXISTS public.homepage_hero_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL DEFAULT '/videos/hero-background.mp4',
  opacity_overlay NUMERIC NOT NULL DEFAULT 0.6,
  autoplay BOOLEAN NOT NULL DEFAULT true,
  loop_video BOOLEAN NOT NULL DEFAULT true,
  muted BOOLEAN NOT NULL DEFAULT true,
  mobile_video_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Hero Text Settings
CREATE TABLE IF NOT EXISTS public.homepage_hero_text (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1_en TEXT NOT NULL DEFAULT 'SPIRIT',
  heading_line2_en TEXT NOT NULL DEFAULT 'CANDLES',
  heading_line1_pl TEXT NOT NULL DEFAULT 'SPIRIT',
  heading_line2_pl TEXT NOT NULL DEFAULT 'CANDLES',
  subtitle_en TEXT NOT NULL DEFAULT 'Reborn Your Nature',
  subtitle_pl TEXT NOT NULL DEFAULT 'Odradzaj swoją naturę',
  description_en TEXT NOT NULL DEFAULT 'Transform your space with handcrafted soy candles',
  description_pl TEXT NOT NULL DEFAULT 'Odmień swoją przestrzeń dzięki ręcznie robionym świecom sojowym',
  cta1_text_en TEXT NOT NULL DEFAULT 'Shop Collection',
  cta1_text_pl TEXT NOT NULL DEFAULT 'Zobacz Kolekcję',
  cta1_link TEXT NOT NULL DEFAULT '/shop',
  cta2_text_en TEXT NOT NULL DEFAULT 'Learn Our Story',
  cta2_text_pl TEXT NOT NULL DEFAULT 'Nasza Historia',
  cta2_link TEXT NOT NULL DEFAULT '/about',
  heading_font_size TEXT NOT NULL DEFAULT 'text-4xl md:text-6xl lg:text-7xl',
  subtitle_font_size TEXT NOT NULL DEFAULT 'text-xl md:text-2xl',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Homepage Features (Why Spirit Candles)
CREATE TABLE IF NOT EXISTS public.homepage_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_pl TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_pl TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- lucide icon name (e.g., 'Truck', 'Leaf', 'Heart')
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tooltip_en TEXT,
  tooltip_pl TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Newsletter Settings
CREATE TABLE IF NOT EXISTS public.newsletter_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_en TEXT NOT NULL DEFAULT 'Join Our Community',
  heading_pl TEXT NOT NULL DEFAULT 'Dołącz Do Naszej Społeczności',
  subtitle_en TEXT NOT NULL DEFAULT 'Subscribe and get 10% off your first order!',
  subtitle_pl TEXT NOT NULL DEFAULT 'Zapisz się i otrzymaj 10% zniżki na pierwsze zamówienie!',
  success_message_en TEXT NOT NULL DEFAULT 'Check your email to receive your 10% discount code!',
  success_message_pl TEXT NOT NULL DEFAULT 'Sprawdź swoją skrzynkę email, aby otrzymać kod rabatowy 10%!',
  discount_percentage INTEGER NOT NULL DEFAULT 10,
  gdpr_text_en TEXT NOT NULL DEFAULT 'I agree to receive the newsletter and accept the privacy policy. I can unsubscribe at any time.',
  gdpr_text_pl TEXT NOT NULL DEFAULT 'Zgadzam się na otrzymywanie newslettera i akceptuję politykę prywatności. Mogę się wypisać w każdej chwili.',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Hero Video
ALTER TABLE public.homepage_hero_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view hero video settings"
  ON public.homepage_hero_video FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hero video settings"
  ON public.homepage_hero_video FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Hero Text
ALTER TABLE public.homepage_hero_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view hero text settings"
  ON public.homepage_hero_text FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hero text settings"
  ON public.homepage_hero_text FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Homepage Features
ALTER TABLE public.homepage_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active features"
  ON public.homepage_features FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage features"
  ON public.homepage_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Newsletter Settings
ALTER TABLE public.newsletter_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view newsletter settings"
  ON public.newsletter_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage newsletter settings"
  ON public.newsletter_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default Hero Video Settings
INSERT INTO public.homepage_hero_video (video_url, opacity_overlay, autoplay, loop_video, muted)
VALUES ('/videos/hero-background.mp4', 0.6, true, true, true);

-- Default Hero Text Settings
INSERT INTO public.homepage_hero_text (
  heading_line1_en, heading_line2_en, heading_line1_pl, heading_line2_pl,
  subtitle_en, subtitle_pl, description_en, description_pl,
  cta1_text_en, cta1_text_pl, cta1_link,
  cta2_text_en, cta2_text_pl, cta2_link
)
VALUES (
  'SPIRIT', 'CANDLES', 'SPIRIT', 'CANDLES',
  'Reborn Your Nature', 'Odradzaj swoją naturę',
  'Transform your space with handcrafted soy candles that inspire and elevate your everyday moments',
  'Odmień swoją przestrzeń dzięki ręcznie robionym świecom sojowym, które inspirują i wywyższają twoje codzienne chwile',
  'Shop Collection', 'Zobacz Kolekcję', '/shop',
  'Learn Our Story', 'Nasza Historia', '/about'
);

-- Default Homepage Features (Why Spirit Candles)
INSERT INTO public.homepage_features (title_en, title_pl, description_en, description_pl, icon_name, display_order, tooltip_en, tooltip_pl)
VALUES
  ('Shipping', 'Wysyłka', 'Fast and reliable delivery', 'Szybka i niezawodna dostawa', 'Truck', 1, 'Safe, fast, and reliable shipping!', 'Spedizione sicura, veloce ed affidabile!'),
  ('100% Natural', '100% Naturalne', 'Premium soy wax candles', 'Świece z najwyższej jakości wosku sojowego', 'Leaf', 2, 'Made from sustainable soy wax', 'Wykonane z ekologicznego wosku sojowego'),
  ('Handcrafted', 'Ręcznie Robione', 'Made with love and care', 'Wykonane z miłością i troską', 'Heart', 3, 'Each candle is unique', 'Każda świeca jest unikalna'),
  ('Premium Fragrances', 'Premium Zapachy', 'Inspired by luxury brands', 'Inspirowane luksusowymi markami', 'Sparkles', 4, 'Long-lasting premium scents', 'Trwałe premium zapachy');

-- Default Newsletter Settings
INSERT INTO public.newsletter_settings (
  heading_en, heading_pl, subtitle_en, subtitle_pl,
  success_message_en, success_message_pl, discount_percentage,
  gdpr_text_en, gdpr_text_pl, is_active
)
VALUES (
  'Join Our Community', 'Dołącz Do Naszej Społeczności',
  'Subscribe and get 10% off your first order!', 'Zapisz się i otrzymaj 10% zniżki na pierwsze zamówienie!',
  'Check your email to receive your 10% discount code!', 'Sprawdź swoją skrzynkę email, aby otrzymać kod rabatowy 10%!',
  10,
  'I agree to receive the newsletter and accept the privacy policy. I can unsubscribe at any time.',
  'Zgadzam się na otrzymywanie newslettera i akceptuję politykę prywatności. Mogę się wypisać w każdej chwili.',
  true
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_homepage_hero_video_updated_at
  BEFORE UPDATE ON public.homepage_hero_video
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_hero_text_updated_at
  BEFORE UPDATE ON public.homepage_hero_text
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homepage_features_updated_at
  BEFORE UPDATE ON public.homepage_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_settings_updated_at
  BEFORE UPDATE ON public.newsletter_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();