-- Store monetary values with cents
ALTER TABLE public.orders
  ALTER COLUMN total_pln TYPE numeric(10,2) USING total_pln::numeric,
  ALTER COLUMN total_eur TYPE numeric(10,2) USING total_eur::numeric,
  ALTER COLUMN shipping_cost_pln TYPE numeric(10,2) USING shipping_cost_pln::numeric,
  ALTER COLUMN shipping_cost_eur TYPE numeric(10,2) USING shipping_cost_eur::numeric;

ALTER TABLE public.order_items
  ALTER COLUMN price_pln TYPE numeric(10,2) USING price_pln::numeric,
  ALTER COLUMN price_eur TYPE numeric(10,2) USING price_eur::numeric;