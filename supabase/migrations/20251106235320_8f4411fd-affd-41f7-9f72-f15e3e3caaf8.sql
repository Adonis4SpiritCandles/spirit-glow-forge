-- Fix RLS policies per profile_comments per garantire funzionamento commenti social

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view nested replies" ON public.profile_comments;
DROP POLICY IF EXISTS "Anyone can view visible comments" ON public.profile_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.profile_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.profile_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.profile_comments;

-- Create new comprehensive policies
CREATE POLICY "Comments select visible"
ON public.profile_comments
FOR SELECT
TO authenticated
USING (is_visible = true OR profile_user_id = auth.uid() OR commenter_id = auth.uid());

CREATE POLICY "Comments insert authenticated"
ON public.profile_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Comments update own"
ON public.profile_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = commenter_id)
WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Comments delete own or admin"
ON public.profile_comments
FOR DELETE
TO authenticated
USING (auth.uid() = commenter_id OR has_role(auth.uid(), 'admin'));

-- Ensure authenticated role has necessary grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_comments TO authenticated;