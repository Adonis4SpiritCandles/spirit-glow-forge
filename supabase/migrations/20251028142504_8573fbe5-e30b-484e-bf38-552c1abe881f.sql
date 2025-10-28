-- Add preview_image_url column to social_posts table for video thumbnails
ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS preview_image_url TEXT;