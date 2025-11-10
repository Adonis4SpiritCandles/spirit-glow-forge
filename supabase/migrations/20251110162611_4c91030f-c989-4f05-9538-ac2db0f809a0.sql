-- Add mobile logo settings to header_settings
ALTER TABLE header_settings
ADD COLUMN IF NOT EXISTS mobile_logo_url text DEFAULT '/assets/icon-logo-candle-transparent.png',
ADD COLUMN IF NOT EXISTS mobile_logo_height text DEFAULT 'h-14',
ADD COLUMN IF NOT EXISTS mobile_logo_animation jsonb DEFAULT '{"enabled": true, "speed": "4s", "glow_intensity": "0.4", "hover_scale": "1.05"}'::jsonb,
ADD COLUMN IF NOT EXISTS tablet_logo_url text DEFAULT '/assets/icon-logo-candle-transparent.png',
ADD COLUMN IF NOT EXISTS tablet_logo_height text DEFAULT 'h-12',
ADD COLUMN IF NOT EXISTS tablet_logo_animation jsonb DEFAULT '{"enabled": true, "speed": "4s", "glow_intensity": "0.4", "hover_scale": "1.05"}'::jsonb;

-- Inventory tracking tables
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder')),
  threshold integer NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reorder_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity_ordered integer NOT NULL,
  supplier text,
  order_date timestamptz DEFAULT now(),
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'damaged')),
  quantity_change integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reference_id uuid,
  reference_type text,
  notes text,
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now()
);

-- Customer segmentation tables
CREATE TABLE IF NOT EXISTS customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_pl text NOT NULL,
  description_en text,
  description_pl text,
  segment_type text NOT NULL CHECK (segment_type IN ('purchase_based', 'engagement_based', 'behavior_based', 'custom')),
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS segment_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid REFERENCES customer_segments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(segment_id, user_id)
);

-- Enable RLS
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory tables (admin only)
CREATE POLICY "Admins can manage inventory alerts" ON inventory_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reorder history" ON reorder_history
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view stock movements" ON stock_movements
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert stock movements" ON stock_movements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for segmentation
CREATE POLICY "Admins can manage segments" ON customer_segments
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage segment members" ON segment_members
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reorder_history_product ON reorder_history(product_id);
CREATE INDEX IF NOT EXISTS idx_segment_members_segment ON segment_members(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_members_user ON segment_members(user_id);

-- Function to log stock movements automatically
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity_change,
      previous_stock,
      new_stock,
      notes
    ) VALUES (
      NEW.id,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'
        ELSE 'adjustment'
      END,
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'Automatic stock update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic stock movement logging
DROP TRIGGER IF EXISTS trigger_log_stock_movement ON products;
CREATE TRIGGER trigger_log_stock_movement
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION log_stock_movement();

-- Function to check and trigger low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
BEGIN
  FOR alert_record IN 
    SELECT * FROM inventory_alerts 
    WHERE product_id = NEW.id 
    AND is_active = true
  LOOP
    IF alert_record.alert_type = 'low_stock' AND NEW.stock_quantity <= alert_record.threshold THEN
      UPDATE inventory_alerts 
      SET last_triggered_at = now() 
      WHERE id = alert_record.id;
    ELSIF alert_record.alert_type = 'out_of_stock' AND NEW.stock_quantity = 0 THEN
      UPDATE inventory_alerts 
      SET last_triggered_at = now() 
      WHERE id = alert_record.id;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for low stock alert checking
DROP TRIGGER IF EXISTS trigger_check_low_stock ON products;
CREATE TRIGGER trigger_check_low_stock
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION check_low_stock_alerts();

-- Update segment member counts
CREATE OR REPLACE FUNCTION update_segment_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_segments
  SET member_count = (
    SELECT COUNT(*) FROM segment_members WHERE segment_id = COALESCE(NEW.segment_id, OLD.segment_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.segment_id, OLD.segment_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for segment member count updates
DROP TRIGGER IF EXISTS trigger_update_segment_count ON segment_members;
CREATE TRIGGER trigger_update_segment_count
  AFTER INSERT OR DELETE ON segment_members
  FOR EACH ROW
  EXECUTE FUNCTION update_segment_member_count();