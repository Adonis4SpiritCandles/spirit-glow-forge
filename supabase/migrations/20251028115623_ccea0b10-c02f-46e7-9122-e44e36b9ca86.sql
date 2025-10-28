-- Create social_posts table for admin-managed Instagram and TikTok content
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  embed_url TEXT,
  external_link TEXT,
  caption TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Social posts are viewable by everyone"
ON public.social_posts
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage social posts"
ON public.social_posts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create index for ordering
CREATE INDEX idx_social_posts_display_order ON public.social_posts(display_order);
CREATE INDEX idx_social_posts_platform ON public.social_posts(platform);

-- Create trigger for updated_at
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();