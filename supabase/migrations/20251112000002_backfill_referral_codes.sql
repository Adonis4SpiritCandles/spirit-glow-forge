-- ========================================
-- BACKFILL REFERRAL_SHORT_CODE
-- ========================================
-- Questa migration genera referral_short_code per tutti gli utenti esistenti
-- che non lo hanno ancora. Viene eseguita una sola volta per backfill.

-- Genera referral_short_code per tutti i profili senza codice
UPDATE public.profiles
SET referral_short_code = public.generate_unique_referral_code()
WHERE referral_short_code IS NULL OR referral_short_code = '';

-- Commento per documentazione
COMMENT ON SCHEMA public IS 
'Backfill completato: tutti i profili esistenti ora hanno referral_short_code.';

