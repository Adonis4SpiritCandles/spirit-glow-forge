-- ========================================
-- CREATE EMAIL MARKETING SETTINGS TABLE
-- ========================================
-- Questa migration crea la tabella email_marketing_settings per gestire
-- la visibilità della sezione newsletter e dei checkbox newsletter in vari punti del sito.

CREATE TABLE IF NOT EXISTS public.email_marketing_settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  
  -- Visibility Toggles (default true to maintain current behavior)
  show_newsletter_section_homepage boolean DEFAULT true,
  show_newsletter_checkbox_registration boolean DEFAULT true,
  show_newsletter_checkbox_contact boolean DEFAULT true,
  
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_marketing_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage email marketing settings
CREATE POLICY "Admins can manage email marketing settings"
ON public.email_marketing_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view email marketing settings
CREATE POLICY "Everyone can view email marketing settings"
ON public.email_marketing_settings FOR SELECT
USING (true);

-- Insert default settings record with all toggles enabled
INSERT INTO public.email_marketing_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE public.email_marketing_settings IS 
'Stores settings for email marketing visibility including newsletter section on homepage and newsletter checkbox visibility in registration and contact forms.';

