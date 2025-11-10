-- Fix publication additions without IF NOT EXISTS using DO blocks

-- Ensure realtime for reactions table
alter table public.profile_comment_reactions replica identity full;
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comment_reactions';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure realtime for wishlist table
alter table public.wishlist replica identity full;
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;