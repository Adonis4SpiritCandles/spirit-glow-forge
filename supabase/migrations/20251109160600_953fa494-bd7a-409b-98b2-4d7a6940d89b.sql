-- Create loyalty_points_history table for tracking point changes
CREATE TABLE IF NOT EXISTS loyalty_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('earn', 'spend', 'bonus')),
  reference_type TEXT CHECK (reference_type IN ('order', 'referral', 'badge', 'review', 'manual')),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_history_user ON loyalty_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_created ON loyalty_points_history(created_at DESC);

-- RLS Policies for loyalty_points_history
ALTER TABLE loyalty_points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own points history"
ON loyalty_points_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert points history"
ON loyalty_points_history FOR INSERT
WITH CHECK (true);

-- Create profile_follows table for follow/unfollow system
CREATE TABLE IF NOT EXISTS profile_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON profile_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON profile_follows(following_id);

-- RLS Policies for profile_follows
ALTER TABLE profile_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view follows"
ON profile_follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow"
ON profile_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON profile_follows FOR DELETE
USING (auth.uid() = follower_id);

-- Add cover_image_url to public_profile_directory if not exists
DO $$ BEGIN
  ALTER TABLE public_profile_directory 
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create function to sync cover_image_url
CREATE OR REPLACE FUNCTION sync_cover_image_to_directory()
RETURNS TRIGGER AS $function$
BEGIN
  UPDATE public_profile_directory
  SET cover_image_url = NEW.cover_image_url,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync cover image changes
DROP TRIGGER IF EXISTS sync_cover_image_trigger ON profiles;
CREATE TRIGGER sync_cover_image_trigger
AFTER UPDATE OF cover_image_url ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_cover_image_to_directory();