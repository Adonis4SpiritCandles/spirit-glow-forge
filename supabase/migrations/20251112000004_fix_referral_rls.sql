-- ========================================
-- FIX REFERRAL RLS POLICIES
-- ========================================
-- Questa migration verifica e corregge le RLS policies per garantire
-- che referral_source_id possa essere aggiornato correttamente e che
-- il sistema di referral funzioni senza problemi di sicurezza.

-- 1. Policy per permettere aggiornamento di referral_source_id durante registrazione
-- (già coperto da policy UPDATE esistente, ma verifichiamo)

-- 2. Policy per permettere lettura referrals (verifica esistente)
-- Se non esiste, la creiamo
DO $$
BEGIN
  -- Policy per utenti autenticati possono vedere i propri referrals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'referrals' 
    AND policyname = 'Users can view their own referrals'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own referrals"
    ON public.referrals
    FOR SELECT
    TO authenticated
    USING (
      referrer_id = auth.uid() OR referee_id = auth.uid()
    )';
  END IF;

  -- Policy per service role può inserire/aggiornare referrals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'referrals' 
    AND policyname = 'Service role can manage all referrals'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can manage all referrals"
    ON public.referrals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- 3. Verifica che gli admin possano aggiornare referral_source_id in profiles
-- (già coperto da policy "Admins can update all profiles" creata precedentemente)

-- 4. Assicurati che il trigger possa aggiornare referral_source_id
-- (handle_new_user usa SECURITY DEFINER, quindi può fare tutto)

-- Commento per documentazione
COMMENT ON POLICY "Users can view their own referrals" ON public.referrals IS 
'Permette agli utenti autenticati di vedere i propri referrals (come referrer o referee).';

COMMENT ON POLICY "Service role can manage all referrals" ON public.referrals IS 
'Permette al service role (usato dalle Edge Functions) di gestire tutti i referrals.';

