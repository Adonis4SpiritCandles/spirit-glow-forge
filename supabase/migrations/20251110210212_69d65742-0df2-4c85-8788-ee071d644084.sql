-- Add profile_comment_likes table for Spirit Post likes
CREATE TABLE IF NOT EXISTS profile_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES profile_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- RLS Policies
ALTER TABLE profile_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like comments"
  ON profile_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their likes"
  ON profile_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view likes"
  ON profile_comment_likes FOR SELECT
  USING (true);

-- Add banned column to public_profile_directory for social moderation
ALTER TABLE public_profile_directory ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;

-- Policy: Banned users can't comment
CREATE POLICY "Banned users can't comment"
  ON profile_comments FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public_profile_directory
      WHERE user_id = auth.uid() AND banned = true
    )
  );