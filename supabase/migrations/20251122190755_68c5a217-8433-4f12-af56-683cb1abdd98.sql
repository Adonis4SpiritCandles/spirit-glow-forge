
-- Crea 5 ordini demo per giacomofurlari@libero.it

-- Ordine 1: PAGATO (status='paid')
WITH order1 AS (
  INSERT INTO orders (
    user_id, status, shipping_status, total_pln, total_eur,
    shipping_cost_pln, shipping_cost_eur, shipping_address,
    carrier, carrier_name, service_id, order_number
  ) VALUES (
    '253f0a66-7932-4ecc-a804-211581e9ffab', 'paid', null, 185.00, 45.33,
    25.00, 6.13,
    '{"name": "Giacomo Furlari", "street": "Via Roma 123", "city": "Warsaw", "postalCode": "02-180", "country": "Poland", "email": "giacomofurlari@libero.it", "phone": "+48123456789"}'::jsonb,
    'inpost', 'InPost Kurier', 1234, 10001
  ) RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, price_pln, price_eur)
SELECT 
  order1.id,
  unnest(ARRAY['70c30e10-1d2f-4dab-bf63-1932d11c561b'::uuid, 'aff39043-4cd4-4208-ab30-4d424901f1fc'::uuid]),
  unnest(ARRAY[2, 1]),
  unnest(ARRAY[60.00, 60.00]),
  unnest(ARRAY[14.70, 14.70])
FROM order1;

-- Ordine 2: IN ATTESA DI CONFERMA (status='pending')
WITH order2 AS (
  INSERT INTO orders (
    user_id, status, shipping_status, total_pln, total_eur,
    shipping_cost_pln, shipping_cost_eur, shipping_address,
    carrier, carrier_name, service_id, order_number
  ) VALUES (
    '253f0a66-7932-4ecc-a804-211581e9ffab', 'pending', null, 145.00, 35.54,
    25.00, 6.13,
    '{"name": "Giacomo Furlari", "street": "Via Roma 123", "city": "Warsaw", "postalCode": "02-180", "country": "Poland", "email": "giacomofurlari@libero.it", "phone": "+48123456789"}'::jsonb,
    'dpd', 'DPD Classic', 1235, 10002
  ) RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, price_pln, price_eur)
SELECT 
  order2.id,
  unnest(ARRAY['63da19ae-b2b3-4166-b6aa-569856cd72c1'::uuid, '3de12ed7-63b7-4b60-9fb9-aa9d4e7d128c'::uuid]),
  unnest(ARRAY[1, 1]),
  unnest(ARRAY[60.00, 60.00]),
  unnest(ARRAY[14.70, 14.70])
FROM order2;

-- Ordine 3: CONFERMATO MA NON INVIATO (status='preparing', shipping_status=null)
WITH order3 AS (
  INSERT INTO orders (
    user_id, status, shipping_status, total_pln, total_eur,
    shipping_cost_pln, shipping_cost_eur, shipping_address,
    carrier, carrier_name, service_id, order_number, admin_seen
  ) VALUES (
    '253f0a66-7932-4ecc-a804-211581e9ffab', 'preparing', null, 205.00, 50.25,
    25.00, 6.13,
    '{"name": "Giacomo Furlari", "street": "Via Roma 123", "city": "Warsaw", "postalCode": "02-180", "country": "Poland", "email": "giacomofurlari@libero.it", "phone": "+48123456789"}'::jsonb,
    'inpost', 'InPost Kurier', 1236, 10003, true
  ) RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, price_pln, price_eur)
SELECT 
  order3.id,
  unnest(ARRAY['e00367a1-38a4-4851-807f-acf020f26af8'::uuid, '67b13747-3df0-4072-9b44-3ecf6310c29c'::uuid, '85e496d8-464a-44e2-8990-75f9406671b8'::uuid]),
  unnest(ARRAY[1, 1, 1]),
  unnest(ARRAY[60.00, 60.00, 60.00]),
  unnest(ARRAY[14.70, 14.70, 14.70])
FROM order3;

-- Ordine 4: INVIATO A FURGONETKA (status='preparing', shipping_status='created')
WITH order4 AS (
  INSERT INTO orders (
    user_id, status, shipping_status, total_pln, total_eur,
    shipping_cost_pln, shipping_cost_eur, shipping_address,
    carrier, carrier_name, service_id, order_number, admin_seen,
    furgonetka_package_id, shipping_label_url
  ) VALUES (
    '253f0a66-7932-4ecc-a804-211581e9ffab', 'preparing', 'created', 165.00, 40.46,
    25.00, 6.13,
    '{"name": "Giacomo Furlari", "street": "Via Roma 123", "city": "Warsaw", "postalCode": "02-180", "country": "Poland", "email": "giacomofurlari@libero.it", "phone": "+48123456789"}'::jsonb,
    'dpd', 'DPD Classic', 1237, 10004, true,
    'FGN-TEST-PKG-001', 'https://furgonetka.pl/labels/FGN-TEST-PKG-001.pdf'
  ) RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, price_pln, price_eur)
SELECT 
  order4.id,
  unnest(ARRAY['08d264e8-4f89-4a7c-a4dc-be413daa12c0'::uuid, '1e2a3ad0-3220-4118-8451-62c4ff8872e4'::uuid]),
  unnest(ARRAY[1, 1]),
  unnest(ARRAY[60.00, 60.00]),
  unnest(ARRAY[14.70, 14.70])
FROM order4;

-- Ordine 5: CON TRACKING DISPONIBILE (status='shipped', shipping_status='shipped')
WITH order5 AS (
  INSERT INTO orders (
    user_id, status, shipping_status, total_pln, total_eur,
    shipping_cost_pln, shipping_cost_eur, shipping_address,
    carrier, carrier_name, service_id, order_number, admin_seen,
    furgonetka_package_id, shipping_label_url, tracking_number, tracking_url, tracking_email_sent
  ) VALUES (
    '253f0a66-7932-4ecc-a804-211581e9ffab', 'shipped', 'shipped', 225.00, 55.16,
    25.00, 6.13,
    '{"name": "Giacomo Furlari", "street": "Via Roma 123", "city": "Warsaw", "postalCode": "02-180", "country": "Poland", "email": "giacomofurlari@libero.it", "phone": "+48123456789"}'::jsonb,
    'inpost', 'InPost Kurier', 1238, 10005, true,
    'FGN-TEST-PKG-002', 'https://furgonetka.pl/labels/FGN-TEST-PKG-002.pdf',
    'INP1234567890PL', 'https://furgonetka.pl/zlokalizuj/INP1234567890PL', true
  ) RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, price_pln, price_eur)
SELECT 
  order5.id,
  unnest(ARRAY['ea15a977-970c-4367-bff1-9f91b23f0f1c'::uuid, '70c30e10-1d2f-4dab-bf63-1932d11c561b'::uuid, 'aff39043-4cd4-4208-ab30-4d424901f1fc'::uuid]),
  unnest(ARRAY[2, 1, 1]),
  unnest(ARRAY[60.00, 60.00, 60.00]),
  unnest(ARRAY[14.70, 14.70, 14.70])
FROM order5;
