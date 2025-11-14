-- ========================================
-- AUTO-GENERATE REFERRAL_SHORT_CODE
-- ========================================
-- Questa migration aggiunge una funzione e un trigger per generare
-- automaticamente referral_short_code quando viene creato un nuovo profilo.
-- Questo garantisce che tutti gli utenti abbiano un codice referral univoco.

-- 1. Funzione SQL per generare referral_short_code univoco (8 caratteri)
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Rimossi caratteri simili (0,O,I,1)
  code text := '';
  i integer;
  is_unique boolean := false;
  attempts integer := 0;
BEGIN
  -- Genera codice finché non è univoco (max 20 tentativi)
  WHILE NOT is_unique AND attempts < 20 LOOP
    code := '';
    -- Genera 8 caratteri casuali
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Verifica se il codice esiste già
    SELECT NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_short_code = code
    ) INTO is_unique;
    
    attempts := attempts + 1;
  END LOOP;
  
  -- Se non riuscito dopo 20 tentativi, aggiungi timestamp
  IF NOT is_unique THEN
    code := code || substr(md5(now()::text || random()::text), 1, 4);
  END IF;
  
  RETURN code;
END;
$$;

-- 2. Funzione trigger per generare automaticamente referral_short_code
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Genera referral_short_code solo se non esiste già
  IF NEW.referral_short_code IS NULL OR NEW.referral_short_code = '' THEN
    NEW.referral_short_code := public.generate_unique_referral_code();
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Crea trigger BEFORE INSERT su profiles
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON public.profiles;
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_referral_code();

-- 4. Crea trigger anche su UPDATE per utenti esistenti senza codice
CREATE OR REPLACE FUNCTION public.ensure_referral_code_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Genera referral_short_code solo se è NULL o vuoto
  IF (NEW.referral_short_code IS NULL OR NEW.referral_short_code = '') THEN
    NEW.referral_short_code := public.generate_unique_referral_code();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_referral_code_update ON public.profiles;
CREATE TRIGGER trigger_ensure_referral_code_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_short_code IS NULL OR NEW.referral_short_code = '')
  EXECUTE FUNCTION public.ensure_referral_code_on_update();

-- Commenti per documentazione
COMMENT ON FUNCTION public.generate_unique_referral_code() IS 
'Genera un codice referral univoco di 8 caratteri alfanumerici (senza caratteri ambigui).';

COMMENT ON FUNCTION public.auto_generate_referral_code() IS 
'Trigger function che genera automaticamente referral_short_code alla creazione di un nuovo profilo.';

COMMENT ON FUNCTION public.ensure_referral_code_on_update() IS 
'Trigger function che genera referral_short_code quando viene aggiornato un profilo senza codice.';

