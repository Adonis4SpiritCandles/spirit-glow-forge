-- Ensure RLS policies for profile_comment_reactions to allow toggling reactions
-- Safe recreate policies
ALTER TABLE public.profile_comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own reactions" ON public.profile_comment_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.profile_comment_reactions;
DROP POLICY IF EXISTS "Everyone can view reactions" ON public.profile_comment_reactions;

CREATE POLICY "Users can insert own reactions"
ON public.profile_comment_reactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
ON public.profile_comment_reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view reactions"
ON public.profile_comment_reactions
FOR SELECT
USING (true);

-- Optional: prevent duplicate reaction per user per comment per type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_reaction_user_comment_type'
  ) THEN
    CREATE UNIQUE INDEX uniq_reaction_user_comment_type
    ON public.profile_comment_reactions (comment_id, user_id, reaction_type);
  END IF;
END $$;
