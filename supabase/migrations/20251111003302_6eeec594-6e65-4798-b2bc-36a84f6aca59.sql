-- Ensure reactions table with constraints and policies
CREATE TABLE IF NOT EXISTS public.profile_comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like','love','fire')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcr_comment_id ON public.profile_comment_reactions(comment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pcr_unique ON public.profile_comment_reactions(comment_id, user_id, reaction_type);

ALTER TABLE public.profile_comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pcr_select_all" ON public.profile_comment_reactions;
DROP POLICY IF EXISTS "pcr_insert_own" ON public.profile_comment_reactions;
DROP POLICY IF EXISTS "pcr_delete_own" ON public.profile_comment_reactions;
DROP POLICY IF EXISTS "pcr_admin_delete" ON public.profile_comment_reactions;

CREATE POLICY "pcr_select_all"
ON public.profile_comment_reactions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "pcr_insert_own"
ON public.profile_comment_reactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pcr_delete_own"
ON public.profile_comment_reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "pcr_admin_delete"
ON public.profile_comment_reactions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profile_comment_reactions REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='profile_comment_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comment_reactions;
  END IF;
END $$;

-- Ensure follows table with constraints and policies
CREATE TABLE IF NOT EXISTS public.profile_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follower_not_self CHECK (follower_id <> following_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pf_unique ON public.profile_follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_pf_following ON public.profile_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_pf_follower ON public.profile_follows(follower_id);

ALTER TABLE public.profile_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pf_select_all" ON public.profile_follows;
DROP POLICY IF EXISTS "pf_insert_own" ON public.profile_follows;
DROP POLICY IF EXISTS "pf_delete_own" ON public.profile_follows;

CREATE POLICY "pf_select_all"
ON public.profile_follows
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "pf_insert_own"
ON public.profile_follows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "pf_delete_own"
ON public.profile_follows
FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

ALTER TABLE public.profile_follows REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='profile_follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_follows;
  END IF;
END $$;

-- Notifications table for social actions
CREATE TABLE IF NOT EXISTS public.profile_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  profile_user_id uuid,
  type text NOT NULL,
  message_en text,
  message_pl text,
  action_url text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pn_select_own" ON public.profile_notifications;
DROP POLICY IF EXISTS "pn_insert_any_auth" ON public.profile_notifications;
DROP POLICY IF EXISTS "pn_update_read_own" ON public.profile_notifications;
DROP POLICY IF EXISTS "pn_delete_own_or_admin" ON public.profile_notifications;

CREATE POLICY "pn_select_own"
ON public.profile_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "pn_insert_any_auth"
ON public.profile_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "pn_update_read_own"
ON public.profile_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pn_delete_own_or_admin"
ON public.profile_notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profile_notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='profile_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_notifications;
  END IF;
END $$;

-- Triggered notifications for follow/unfollow
CREATE OR REPLACE FUNCTION public.notify_follow() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profile_notifications (user_id, actor_id, profile_user_id, type, message_en, message_pl, action_url)
  VALUES (NEW.following_id, NEW.follower_id, NEW.following_id, 'follow',
          'started following you', 'zaczął Cię obserwować', '/profile/' || NEW.follower_id);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_follow ON public.profile_follows;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.profile_follows
FOR EACH ROW EXECUTE PROCEDURE public.notify_follow();

CREATE OR REPLACE FUNCTION public.notify_unfollow() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profile_notifications (user_id, actor_id, profile_user_id, type, message_en, message_pl, action_url)
  VALUES (OLD.following_id, OLD.follower_id, OLD.following_id, 'unfollow',
          'stopped following you', 'przestał Cię obserwować', '/profile/' || OLD.follower_id);
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_unfollow ON public.profile_follows;
CREATE TRIGGER trg_notify_unfollow AFTER DELETE ON public.profile_follows
FOR EACH ROW EXECUTE PROCEDURE public.notify_unfollow();