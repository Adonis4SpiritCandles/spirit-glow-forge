-- ========================================
-- CREATE ABOUT PAGE SETTINGS TABLE
-- ========================================
-- Questa migration crea la tabella about_settings per gestire
-- le impostazioni della pagina About dall'admin dashboard.

CREATE TABLE IF NOT EXISTS public.about_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hero Section
  hero_image_url text DEFAULT '/assets/candle-wax.png',
  hero_title_en text DEFAULT 'Reborn Your Nature',
  hero_title_pl text DEFAULT 'Odradzaj swoją naturę',
  hero_intro1_en text DEFAULT 'At SPIRIT CANDLES, we believe in the transformative power of scent. Our journey began with a passion for creating luxury soy candles that not only illuminate your space but also awaken your senses.',
  hero_intro1_pl text DEFAULT 'W SPIRIT CANDLES wierzymy w transformacyjną moc zapachu. Nasza podróż rozpoczęła się od pasji do tworzenia luksusowych świec sojowych, które nie tylko oświetlają Twoją przestrzeń, ale także budzą Twoje zmysły.',
  hero_intro2_en text DEFAULT 'Each candle is handcrafted with care, using only the finest natural ingredients. Inspired by iconic fragrances from luxury brands, we bring you a collection that embodies elegance, sophistication, and the essence of timeless beauty.',
  hero_intro2_pl text DEFAULT 'Każda świeca jest ręcznie wykonywana z troską, używając tylko najwyższej jakości naturalnych składników. Inspirowane kultowymi zapachami luksusowych marek, oferujemy kolekcję, która ucieleśnia elegancję, wyrafinowanie i esencję ponadczasowego piękna.',
  hero_button_text_en text DEFAULT 'Discover Our Collection',
  hero_button_text_pl text DEFAULT 'Odkryj Naszą Kolekcję',
  hero_button_link text DEFAULT '/shop',
  
  -- Features Section
  features_section_title_en text DEFAULT 'Why Choose SPIRIT CANDLES',
  features_section_title_pl text DEFAULT 'Dlaczego Wybrać SPIRIT CANDLES',
  features_section_description_en text DEFAULT 'Discover what makes our candles special and why they are the perfect addition to your home.',
  features_section_description_pl text DEFAULT 'Odkryj, co czyni nasze świece wyjątkowymi i dlaczego są idealnym dodatkiem do Twojego domu.',
  
  -- Features (JSONB array)
  -- Each feature: { icon: string, title_en: string, title_pl: string, description_en: string, description_pl: string, link?: string }
  features jsonb DEFAULT '[
    {
      "icon": "leaf",
      "title_en": "100% Natural Soy Wax",
      "title_pl": "100% Naturalny Wosk Sojowy",
      "description_en": "Made from pure soy wax for clean, long-lasting burns",
      "description_pl": "Wykonane z czystego wosku sojowego dla czystego, długotrwałego spalania"
    },
    {
      "icon": "heart",
      "title_en": "Handcrafted with Love",
      "title_pl": "Ręcznie Robione z Miłością",
      "description_en": "Each candle is carefully crafted by skilled artisans",
      "description_pl": "Każda świeca jest starannie wykonana przez wykwalifikowanych rzemieślników"
    },
    {
      "icon": "flame",
      "title_en": "Premium Fragrances",
      "title_pl": "Premium Zapachy",
      "description_en": "Inspired by luxury brands with high-quality scent oils",
      "description_pl": "Inspirowane luksusowymi markami z wysokiej jakości olejkami zapachowymi"
    },
    {
      "icon": "award",
      "title_en": "Eco-Friendly",
      "title_pl": "Przyjazne dla Środowiska",
      "description_en": "Sustainable materials and packaging for a better planet",
      "description_pl": "Zrównoważone materiały i opakowania dla lepszej planety"
    },
    {
      "icon": "leaf",
      "title_en": "Long Burning Time",
      "title_pl": "Długi Czas Spalania",
      "description_en": "Up to 45 hours of aromatic enjoyment per candle",
      "description_pl": "Do 45 godzin aromatycznej przyjemności na świecę"
    },
    {
      "icon": "award",
      "title_en": "Custom Candles",
      "title_pl": "Personalizowane Świece",
      "description_en": "Create your own personalized candle with custom label or fragrance",
      "description_pl": "Stwórz swoją własną spersonalizowaną świecę z personalizowaną etykietą lub zapachem",
      "link": "/custom-candles"
    }
  ]'::jsonb,
  
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage about settings
CREATE POLICY "Admins can manage about settings"
ON public.about_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view active about settings
CREATE POLICY "Everyone can view active about settings"
ON public.about_settings FOR SELECT
USING (is_active = true);

-- Insert default settings record
INSERT INTO public.about_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE public.about_settings IS 
'Stores settings for the About page including hero section, features, and all content (EN/PL).';

