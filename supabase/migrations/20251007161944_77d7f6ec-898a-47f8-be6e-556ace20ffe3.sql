-- Create consent_logs table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  language VARCHAR(2) NOT NULL,
  banner_version VARCHAR(10) NOT NULL DEFAULT '1.0',
  strictly_necessary BOOLEAN NOT NULL DEFAULT true,
  functional BOOLEAN NOT NULL DEFAULT false,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  ip_address TEXT,
  consent_method TEXT NOT NULL CHECK (consent_method IN ('accept_all', 'reject_all', 'custom', 'initial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for consent_logs
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent logs"
ON public.consent_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert consent logs"
ON public.consent_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all consent logs"
ON public.consent_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Add consent fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_consent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMPTZ;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_session_id ON public.consent_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_timestamp ON public.consent_logs(timestamp DESC);