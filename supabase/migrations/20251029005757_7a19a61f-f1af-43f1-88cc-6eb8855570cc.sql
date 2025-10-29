-- Create Site Settings tables for Footer management

-- 1. Footer Social Icons table
CREATE TABLE IF NOT EXISTS public.footer_social_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  link_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.footer_social_icons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active social icons"
  ON public.footer_social_icons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage social icons"
  ON public.footer_social_icons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Footer Contact Info table
CREATE TABLE IF NOT EXISTS public.footer_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'SPIRIT CANDLES',
  company_legal_name TEXT NOT NULL DEFAULT 'M5M Limited Sp. z o.o. oddział w Polsce',
  address_line1 TEXT NOT NULL DEFAULT 'Grzybowska 2/31',
  address_line2 TEXT DEFAULT '00‑131 Warszawa',
  nip TEXT NOT NULL DEFAULT '5252998035',
  regon TEXT NOT NULL DEFAULT '528769795',
  phone TEXT NOT NULL DEFAULT '+48 729877557',
  email TEXT NOT NULL DEFAULT 'm5moffice@proton.me',
  languages TEXT NOT NULL DEFAULT 'Available in Polish and English',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.footer_contact_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view contact info"
  ON public.footer_contact_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage contact info"
  ON public.footer_contact_info FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Footer Disclaimers table
CREATE TABLE IF NOT EXISTS public.footer_disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspiration_notice_en TEXT NOT NULL DEFAULT 'All Spirit Candles products are inspired by popular fragrances from well-known brands but are not affiliated with them.',
  inspiration_notice_pl TEXT NOT NULL DEFAULT 'Wszystkie produkty Spirit Candles są inspirowane popularnymi zapachami znanych marek, ale nie są z nimi powiązane.',
  independent_brand_en TEXT NOT NULL DEFAULT 'Spirit Candles is an independent brand of M5M Limited',
  independent_brand_pl TEXT NOT NULL DEFAULT 'Spirit Candles jest niezależną marką firmy M5M Limited',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.footer_disclaimers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view disclaimers"
  ON public.footer_disclaimers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage disclaimers"
  ON public.footer_disclaimers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Legal Documents table
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_pl TEXT NOT NULL,
  pdf_url_en TEXT,
  pdf_url_pl TEXT,
  page_route TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view legal documents"
  ON public.legal_documents FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage legal documents"
  ON public.legal_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default social icons
INSERT INTO public.footer_social_icons (name, link_url, display_order) VALUES
  ('Facebook', 'https://www.facebook.com/profile.php?id=61571360287880', 1),
  ('Instagram', 'https://www.instagram.com/spirit_candle_official/', 2),
  ('X (Twitter)', 'https://x.com/SpiritCandlePL', 3)
ON CONFLICT DO NOTHING;

-- Insert default contact info
INSERT INTO public.footer_contact_info (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default disclaimers
INSERT INTO public.footer_disclaimers (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default legal documents
INSERT INTO public.legal_documents (document_type, title_en, title_pl, page_route, pdf_url_en, pdf_url_pl) VALUES
  ('privacy_policy', 'Privacy Policy', 'Polityka prywatności', '/privacy-policy', '/documents/privacy-policy-en.pdf', '/documents/polityka-prywatnosci-pl.pdf'),
  ('cookie_policy', 'Cookie Policy', 'Polityka plików cookie', '/cookie-policy', '/documents/cookie-policy-en.pdf', '/documents/polityka-plikow-cookie-pl.pdf'),
  ('terms_of_sale', 'Terms of Sale', 'Regulamin sprzedaży', '/terms-of-sale', '/documents/terms-of-sale-en.pdf', '/documents/regulamin-sprzedazy-pl.pdf'),
  ('shipping_returns', 'Shipping & Returns', 'Dostawa i zwroty', '/shipping-returns', '/documents/shipping-returns-en.pdf', '/documents/dostawa-zwroty-pl.pdf'),
  ('legal_notice', 'Legal Notice', 'Nota prawna', '/legal-notice', '/documents/legal-notice-en.pdf', '/documents/nota-prawna-pl.pdf'),
  ('accessibility', 'Accessibility', 'Dostępność', '/accessibility', '/documents/accessibility-en.pdf', '/documents/dostepnosc-pl.pdf'),
  ('data_request', 'Data Request', 'Wniosek o dane', '/data-request', '/documents/data-request-en.pdf', '/documents/wniosek-o-dane-pl.pdf'),
  ('privacy_registration', 'Privacy Registration', 'Polityka prywatności rejestracji', '/privacy-registration', '/documents/privacy-policy-registration-en.pdf', '/documents/polityka-prywatnosci-rejestracji-pl.pdf'),
  ('all_notices', 'All Notices', 'Wszystkie informacje', '/all-notices', '/documents/all-notices-en.pdf', '/documents/all-notices-pl.pdf')
ON CONFLICT (document_type) DO NOTHING;

-- Create update trigger for timestamps
CREATE TRIGGER update_footer_social_icons_updated_at
  BEFORE UPDATE ON public.footer_social_icons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_footer_contact_info_updated_at
  BEFORE UPDATE ON public.footer_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_footer_disclaimers_updated_at
  BEFORE UPDATE ON public.footer_disclaimers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();