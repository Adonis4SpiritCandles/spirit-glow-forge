-- Create custom_candles_settings table for admin management

CREATE TABLE IF NOT EXISTS public.custom_candles_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image_url text DEFAULT '/assets/candle-wax.png',
  fragrances jsonb DEFAULT '["Vanilla Dream", "Lavender Fields", "Ocean Breeze", "Sandalwood Musk", "Citrus Burst", "Rose Garden"]'::jsonb,
  info_card_title_en text DEFAULT 'What is Customization?',
  info_card_title_pl text DEFAULT 'Czym jest personalizacja?',
  info_card_text_en text DEFAULT 'Create your perfect candle with our easy customization process. Choose from premium fragrances, select your container style, and add a personal message to make it truly yours.',
  info_card_text_pl text DEFAULT 'Stwórz swoją idealną świecę dzięki naszemu prostemu procesowi personalizacji. Wybierz spośród premium zapachów, wybierz styl pojemnika i dodaj osobistą wiadomość, aby uczynić ją naprawdę swoją.',
  quality_items_en jsonb DEFAULT '["100% natural soy wax", "High-quality fragrance oils", "Handcrafted with passion", "Safe burning up to 45 hours"]'::jsonb,
  quality_items_pl jsonb DEFAULT '["100% naturalny wosk sojowy", "Wysokiej jakości olejki zapachowe", "Ręcznie robione z pasją", "Bezpieczne spalanie do 45 godzin"]'::jsonb,
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_candles_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage settings
CREATE POLICY "Admins can manage custom candles settings"
ON public.custom_candles_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view active settings
CREATE POLICY "Everyone can view custom candles settings"
ON public.custom_candles_settings FOR SELECT
USING (is_active = true);

-- Insert default row with fixed UUID
INSERT INTO public.custom_candles_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE TRIGGER update_custom_candles_settings_updated_at
BEFORE UPDATE ON public.custom_candles_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();