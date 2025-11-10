-- Fix notifications schema to match create_notification function
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_id uuid;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS reference_id uuid;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Ensure existing rows have default metadata
UPDATE public.notifications SET metadata = '{}'::jsonb WHERE metadata IS NULL;