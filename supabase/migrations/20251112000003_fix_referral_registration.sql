-- ========================================
-- FIX REFERRAL REGISTRATION
-- ========================================
-- Questa migration aggiorna handle_new_user per salvare referral_source_id
-- dai metadata durante la registrazione, se presente.

-- Aggiorna handle_new_user per includere referral_source_id dai metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_source_id_value uuid := NULL;
BEGIN
  -- Estrai referral_source_id dai metadata se presente
  IF NEW.raw_user_meta_data ? 'referral_source_id' THEN
    referral_source_id_value := (NEW.raw_user_meta_data->>'referral_source_id')::uuid;
  END IF;

  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    username, 
    preferred_language,
    referral_source_id
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'en'),
    referral_source_id_value
  );
  
  RETURN NEW;
END;
$$;

-- Commento per documentazione
COMMENT ON FUNCTION public.handle_new_user() IS 
'Aggiornata per salvare referral_source_id dai metadata durante la registrazione, se presente.';

