-- Add new columns to general_settings table
ALTER TABLE general_settings 
ADD COLUMN IF NOT EXISTS enable_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_admin_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_registration boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS newsletter_enabled boolean DEFAULT true;

-- Update existing row with default values (if exists)
UPDATE general_settings 
SET 
  enable_notifications = COALESCE(enable_notifications, true),
  enable_admin_notifications = COALESCE(enable_admin_notifications, true),
  maintenance_mode = COALESCE(maintenance_mode, false),
  enable_registration = COALESCE(enable_registration, true),
  newsletter_enabled = COALESCE(newsletter_enabled, true);

-- Insert default row if table is empty
INSERT INTO general_settings (
  id, 
  show_floating_plus, 
  show_live_chat, 
  gradient_overlay_intensity,
  enable_notifications,
  enable_admin_notifications,
  maintenance_mode,
  enable_registration,
  newsletter_enabled
)
SELECT 
  gen_random_uuid(),
  true,
  true,
  20,
  true,
  true,
  false,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM general_settings LIMIT 1);