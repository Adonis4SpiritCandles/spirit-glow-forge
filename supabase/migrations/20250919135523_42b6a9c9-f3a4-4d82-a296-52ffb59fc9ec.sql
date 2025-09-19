-- Make size optional for candles (weight is optional)
ALTER TABLE public.products ALTER COLUMN size DROP NOT NULL;

-- Add search functionality
CREATE OR REPLACE FUNCTION public.search_products(search_text text)
RETURNS TABLE (
  id uuid,
  name_en text,
  name_pl text,
  description_en text,
  description_pl text,
  price_pln integer,
  price_eur integer,
  category text,
  size text,
  stock_quantity integer,
  image_url text
) LANGUAGE sql STABLE AS $$
  SELECT p.id, p.name_en, p.name_pl, p.description_en, p.description_pl, 
         p.price_pln, p.price_eur, p.category, p.size, p.stock_quantity, p.image_url
  FROM public.products p
  WHERE p.name_en ILIKE '%' || search_text || '%'
     OR p.name_pl ILIKE '%' || search_text || '%'
     OR p.description_en ILIKE '%' || search_text || '%'
     OR p.description_pl ILIKE '%' || search_text || '%'
     OR p.category ILIKE '%' || search_text || '%'
  ORDER BY p.name_en;
$$;