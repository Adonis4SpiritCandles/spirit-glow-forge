-- Create junction table for products to multiple collections
CREATE TABLE IF NOT EXISTS product_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(product_id, collection_id)
);

-- Enable RLS
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Public can view product collections
CREATE POLICY "Public can view product collections"
  ON product_collections FOR SELECT
  USING (true);

-- Admins can manage product collections
CREATE POLICY "Admins can manage product collections"
  ON product_collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add index for performance
CREATE INDEX idx_product_collections_product ON product_collections(product_id);
CREATE INDEX idx_product_collections_collection ON product_collections(collection_id);

-- Add preferred_card_tag to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'preferred_card_tag') THEN
    ALTER TABLE products ADD COLUMN preferred_card_tag text DEFAULT 'category';
  END IF;
END $$;