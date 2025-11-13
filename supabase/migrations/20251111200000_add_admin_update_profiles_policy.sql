-- ========================================
-- ADD ADMIN UPDATE POLICY FOR PROFILES
-- ========================================
-- Questa migration aggiunge una policy RLS che permette agli admin
-- di aggiornare qualsiasi campo del profilo, incluso il ruolo.
-- Questo è necessario per permettere agli admin di promuovere/declassare utenti.

-- Rimuovi la policy esistente se presente (per sicurezza)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Crea la policy UPDATE per gli admin
-- Usa is_admin_from_profile() per evitare ricorsione nelle RLS policies
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Permetti se l'utente è admin (verificato tramite profiles.role)
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR
  -- Fallback: usa la funzione security definer
  public.is_admin_from_profile()
)
WITH CHECK (
  -- Stessa verifica per il WITH CHECK
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR
  public.is_admin_from_profile()
);

-- Commento per documentazione
COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS 
'Allows authenticated users with admin role to update any profile, including role changes for promoting/demoting users.';

