-- Create general_settings table
CREATE TABLE IF NOT EXISTS general_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_floating_plus boolean DEFAULT true,
  show_live_chat boolean DEFAULT true,
  gradient_overlay_intensity integer DEFAULT 20,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage general settings
CREATE POLICY "Admins manage general settings"
  ON general_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Policy: Everyone can view general settings
CREATE POLICY "Everyone can view general settings"
  ON general_settings FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO general_settings (show_floating_plus, show_live_chat, gradient_overlay_intensity)
VALUES (true, true, 20)
ON CONFLICT DO NOTHING;

-- Add mobile/tablet config to header_settings
ALTER TABLE header_settings
ADD COLUMN IF NOT EXISTS mobile_config jsonb DEFAULT '{
  "logo_url": "/assets/icon-logo-candle-transparent.png",
  "logo_height": "h-10",
  "logo_animation": {
    "enabled": true,
    "speed": "4s",
    "glow_intensity": "0.4",
    "hover_scale": "1.05"
  }
}'::jsonb,
ADD COLUMN IF NOT EXISTS tablet_config jsonb DEFAULT '{
  "logo_url": "/assets/icon-logo-candle-transparent.png",
  "logo_height": "h-12",
  "logo_animation": {
    "enabled": true,
    "speed": "4s",
    "glow_intensity": "0.4",
    "hover_scale": "1.05"
  }
}'::jsonb;