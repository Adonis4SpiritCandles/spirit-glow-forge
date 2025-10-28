-- Update/Insert 8 official products based on PDF information

-- Clear existing test products if needed
DELETE FROM products WHERE name_en IN ('Ion 2', 'Ion', 'Bubba', 'ASDASDS', 'GAIO EN', 'Prodotto Esempio');

-- Insert the 8 official collections
INSERT INTO products (
  name_en, name_pl, 
  description_en, description_pl,
  category, size, weight,
  price_pln, price_eur,
  stock_quantity, published
) VALUES
-- 1. Scented Dreams
(
  'Scented Dreams',
  'Scented Dreams',
  'An oriental, fruity, and floral fragrance designed for women. Notes of oud, spices, and exotic florals create a captivating atmosphere.',
  'Zapach orientalny, owocowy i kwiatowy stworzony dla kobiet. Nuty oudu, przypraw orientalnych i egzotycznych kwiatów tworzą urzekającą atmosferę.',
  'oriental',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 2. Soya Sanctuary
(
  'Soya Sanctuary',
  'Soya Sanctuary',
  'A sweet, clean, and relaxing scent for women. Notes of wood, vanilla, and patchouli bring peace and serenity to your space.',
  'Słodki, czysty i relaksujący zapach dla kobiet. Nuty drewna, wanilii i paczuli przynoszą spokój i harmonię do Twojego wnętrza.',
  'nature',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 3. Luxury Essence
(
  'Luxury Essence',
  'Luxury Essence',
  'Inspired by Baccarat Rouge 540. A luxurious blend of jasmine, amber, and cedar that creates an atmosphere of pure elegance.',
  'Inspirowane Baccarat Rouge 540. Luksusowa kompozycja jaśminu, bursztynu i cedru, która tworzy atmosferę czystej elegancji.',
  'luxury',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 4. Soya Serenity
(
  'Soya Serenity',
  'Soya Serenity',
  'Sweet vanilla and patchouli relaxation for women. Notes of flowers, cashmere, and amber create a warm, comforting ambiance.',
  'Słodka wanilia i paczuli zapewniają relaks dla kobiet. Nuty kwiatów, kaszmiru i ambry tworzą ciepłą, kojącą atmosferę.',
  'nature',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 5. Divine Scents
(
  'Divine Scents',
  'Divine Scents',
  'Black opium aromatherapy. Rich notes of coffee, vanilla, and white flowers create an addictive and mysterious atmosphere.',
  'Czarne opium aromaterapia. Bogate nuty kawy, wanilii i białych kwiatów tworzą uzależniającą i tajemniczą atmosferę.',
  'oriental',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 6. Scented Serenity
(
  'Scented Serenity',
  'Scented Serenity',
  'Inspired by Chanel No. 5. An elegant floral fragrance for sophisticated women, combining powdery florals with timeless elegance.',
  'Inspirowane Chanel No. 5. Elegancki zapach kwiatowy dla wymagających kobiet, łączący pudrowe nuty z ponadczasową elegancją.',
  'luxury',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 7. Candle Heaven
(
  'Candle Heaven',
  'Candle Heaven',
  'Luxury and relaxation for the soul. A homely oriental fragrance with balms and warm spices that create a sanctuary of peace.',
  'Luksus i relaks dla duszy. Domowy zapach orientalny z balsamami i ciepłymi przyprawami tworzącymi sanktuarium spokoju.',
  'oriental',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
),
-- 8. Elegant Wick
(
  'Elegant Wick',
  'Elegant Wick',
  'Inspired by Dior. A sophisticated blend of citrus, wood, and spices that brings relaxation and elegance to your soul.',
  'Inspirowane Dior. Wyrafinowana mieszanka cytrusów, drewna i przypraw, która przynosi relaks i elegancję Twojej duszy.',
  'luxury',
  '180g',
  '180g',
  11900,
  2900,
  100,
  true
)
ON CONFLICT (id) DO NOTHING;