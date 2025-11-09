-- Add advanced header settings columns
ALTER TABLE header_settings 
ADD COLUMN IF NOT EXISTS desktop_config JSONB DEFAULT '{
  "show_admin_icon": true,
  "show_notification_bell": true,
  "icon_sizes": {
    "admin": "h-4 w-4",
    "notification": "h-5 w-5",
    "profile": "h-6 w-6",
    "cart": "h-5 w-5"
  }
}'::JSONB,
ADD COLUMN IF NOT EXISTS mobile_config JSONB DEFAULT '{
  "show_admin_icon": true,
  "show_notification_bell": true,
  "icon_sizes": {
    "admin": "h-5 w-5",
    "notification": "h-5 w-5",
    "profile": "h-6 w-6",
    "cart": "h-5 w-5"
  }
}'::JSONB,
ADD COLUMN IF NOT EXISTS logo_animation JSONB DEFAULT '{
  "enabled": true,
  "speed": "4s",
  "glow_intensity": "0.4",
  "hover_scale": "1.05"
}'::JSONB;