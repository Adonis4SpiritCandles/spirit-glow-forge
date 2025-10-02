-- FASE 1: Aggiungere lingua e numero ordine (senza foreign key che esiste già)

-- 1.1: Aggiungere colonna preferred_language alla tabella profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(2) DEFAULT 'en' NOT NULL;

-- 1.2: Creare sequenza per numeri ordine
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1 INCREMENT BY 1;

-- 1.3: Aggiungere colonna order_number alla tabella orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_number INTEGER UNIQUE;

-- 1.4: Creare funzione per generare numero ordine automaticamente
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := nextval('public.order_number_seq');
  END IF;
  RETURN NEW;
END;
$$;

-- 1.5: Creare trigger per generare order_number prima dell'insert (se non esiste già)
DROP TRIGGER IF EXISTS orders_order_number ON public.orders;
CREATE TRIGGER orders_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- 1.6: Aggiornare ordini esistenti con numeri progressivi
WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.orders
  WHERE order_number IS NULL
)
UPDATE public.orders o
SET order_number = no.rn
FROM numbered_orders no
WHERE o.id = no.id;

-- 1.7: Aggiornare la sequenza per partire dal numero successivo
SELECT setval('public.order_number_seq', (SELECT COALESCE(MAX(order_number), 0) + 1 FROM public.orders));

-- 1.8: Aggiornare trigger handle_new_user per includere preferred_language
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, username, preferred_language)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;