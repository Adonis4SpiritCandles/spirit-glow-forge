-- Add items jsonb to shared_wishlists for public snapshots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'shared_wishlists' AND column_name = 'items'
  ) THEN
    ALTER TABLE public.shared_wishlists ADD COLUMN items jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Ensure share_token is unique and indexed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_shared_wishlists_share_token'
  ) THEN
    CREATE UNIQUE INDEX idx_shared_wishlists_share_token ON public.shared_wishlists(share_token);
  END IF;
END $$;