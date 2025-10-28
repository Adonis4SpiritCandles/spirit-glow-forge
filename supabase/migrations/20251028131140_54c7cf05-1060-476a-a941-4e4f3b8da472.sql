-- Add bilingual caption fields to social_posts
ALTER TABLE public.social_posts 
  ADD COLUMN IF NOT EXISTS caption_en TEXT,
  ADD COLUMN IF NOT EXISTS caption_pl TEXT;

-- Migrate existing captions to caption_en (default)
UPDATE public.social_posts 
SET caption_en = caption 
WHERE caption IS NOT NULL AND caption_en IS NULL;

-- We keep the old caption column for backward compatibility but it's now optional