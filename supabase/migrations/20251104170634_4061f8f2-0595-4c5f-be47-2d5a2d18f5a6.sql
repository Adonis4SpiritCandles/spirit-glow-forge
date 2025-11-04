-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_pl TEXT NOT NULL,
  description_en TEXT,
  description_pl TEXT,
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  icon_name TEXT,
  gradient_classes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collections RLS policies
CREATE POLICY "Collections viewable by everyone"
  ON public.collections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add collection_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);

-- Create profile_comment_likes table
CREATE TABLE IF NOT EXISTS public.profile_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment likes
ALTER TABLE public.profile_comment_likes ENABLE ROW LEVEL SECURITY;

-- Comment likes RLS policies
CREATE POLICY "Anyone can view comment likes"
  ON public.profile_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON public.profile_comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.profile_comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add parent_comment_id for threaded replies (optional)
ALTER TABLE public.profile_comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.profile_comments(id) ON DELETE CASCADE;

-- Create storage bucket for collection images
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for collection images
CREATE POLICY "Collection images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'collection-images');

CREATE POLICY "Admins can upload collection images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'collection-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update collection images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'collection-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete collection images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'collection-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed initial collections
INSERT INTO public.collections (slug, name_en, name_pl, description_en, description_pl, icon_name, gradient_classes, featured, display_order) 
VALUES
('luxury', 'Luxury Collection', 'Kolekcja Luksusowa', 'Sophisticated fragrances inspired by prestigious perfumes', 'Wyrafinowane zapachy inspirowane prestiżowymi perfumami', 'Crown', 'from-amber-500/20 via-yellow-500/20 to-orange-500/20', true, 1),
('fresh', 'Fresh & Clean', 'Świeże & Czyste', 'Refreshing notes for a clean atmosphere', 'Orzeźwiające nuty dla czystej atmosfery', 'Leaf', 'from-green-500/20 via-emerald-500/20 to-teal-500/20', false, 2),
('romantic', 'Romantic Evening', 'Romantyczny Wieczór', 'Warm, sensual fragrances for special moments', 'Ciepłe, zmysłowe zapachy na wyjątkowe chwile', 'Heart', 'from-rose-500/20 via-pink-500/20 to-red-500/20', false, 3),
('bestsellers', 'Best Sellers', 'Bestsellery', 'Our most popular fragrances loved by customers', 'Nasze najpopularniejsze zapachy uwielbiane przez klientów', 'Sparkles', 'from-purple-500/20 via-violet-500/20 to-indigo-500/20', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Update trigger for collections
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();