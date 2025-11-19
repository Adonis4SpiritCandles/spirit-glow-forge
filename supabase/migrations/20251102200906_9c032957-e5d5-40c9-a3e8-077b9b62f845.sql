-- Create seo_settings table for admin management
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL UNIQUE,
  title_en TEXT,
  title_pl TEXT,
  description_en TEXT,
  description_pl TEXT,
  keywords_en TEXT,
  keywords_pl TEXT,
  og_image_url TEXT,
  noindex BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all SEO settings
CREATE POLICY "Admins can manage SEO settings"
  ON public.seo_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Everyone can view SEO settings
CREATE POLICY "Everyone can view SEO settings"
  ON public.seo_settings
  FOR SELECT
  USING (true);

-- Insert default SEO settings
INSERT INTO public.seo_settings (page_type, title_en, title_pl, description_en, description_pl, keywords_en, keywords_pl, og_image_url) VALUES
('home', 
 'SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles',
 'SPIRIT CANDLES — Odrodź Swoją Naturę | Luksusowe Świece Sojowe',
 'Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances. Handcrafted with natural soy wax and wooden wicks for an elevated sensory experience.',
 'Odkryj luksusowe świece sojowe SPIRIT CANDLES inspirowane kultowymi zapachami. Ręcznie robione z naturalnego wosku sojowego i drewnianymi knotami.',
 'luxury candles, soy candles, wooden wick, natural candles, home fragrance',
 'luksusowe świece, świece sojowe, drewniany knot, naturalne świece',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png'),
 
('shop',
 'Shop Luxury Candles | SPIRIT CANDLES',
 'Sklep z Luksusowymi Świecami | SPIRIT CANDLES',
 'Browse our collection of premium soy candles. Free shipping on orders over €50.',
 'Przeglądaj naszą kolekcję luksusowych świec sojowych. Darmowa wysyłka od 200 PLN.',
 'buy candles, luxury candles online, soy candles shop',
 'kup świece, luksusowe świece online, sklep ze świecami',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png'),
 
('product_default',
 '{product_name} | SPIRIT CANDLES',
 '{product_name} | SPIRIT CANDLES',
 'Premium soy candle inspired by iconic fragrances. Natural ingredients, wooden wick.',
 'Luksusowa świeca sojowa inspirowana kultowymi zapachami. Naturalne składniki, drewniany knot.',
 'soy candle, luxury candle, wooden wick candle',
 'świeca sojowa, luksusowa świeca, świeca z drewnianym knotem',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png'),
 
('collection_default',
 '{collection_name} Collection | SPIRIT CANDLES',
 'Kolekcja {collection_name} | SPIRIT CANDLES',
 'Explore our {collection_name} collection of premium soy candles.',
 'Odkryj naszą kolekcję {collection_name} luksusowych świec sojowych.',
 'candle collection, luxury candles',
 'kolekcja świec, luksusowe świece',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png'),
 
('about',
 'About Us | SPIRIT CANDLES',
 'O Nas | SPIRIT CANDLES',
 'Learn about SPIRIT CANDLES - our story, values, and commitment to quality.',
 'Poznaj SPIRIT CANDLES - naszą historię, wartości i zaangażowanie w jakość.',
 'about spirit candles, candle brand story',
 'o spirit candles, historia marki świec',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png'),
 
('contact',
 'Contact Us | SPIRIT CANDLES',
 'Kontakt | SPIRIT CANDLES',
 'Get in touch with SPIRIT CANDLES. We are here to help.',
 'Skontaktuj się z SPIRIT CANDLES. Jesteśmy tu, aby pomóc.',
 'contact spirit candles, customer service',
 'kontakt spirit candles, obsługa klienta',
 'https://spirit-candle.com/spiritcandles/spirit-logo.png');

-- Trigger for updated_at
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();