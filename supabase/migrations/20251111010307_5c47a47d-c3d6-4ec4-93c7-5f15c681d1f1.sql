-- Fix incorrect trigger functions and remove obsolete trigger causing errors
-- 1) Drop problematic trigger that calls mismatched function/columns
DROP TRIGGER IF EXISTS trigger_notify_new_follower ON public.profile_follows;
DROP FUNCTION IF EXISTS public.notify_new_follower();

-- 2) Update notify_comment_reaction to match actual schema
CREATE OR REPLACE FUNCTION public.notify_comment_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_author_id UUID;
  v_profile_owner_id UUID;
BEGIN
  -- Fetch correct author and profile owner from profile_comments
  SELECT commenter_id, profile_user_id
  INTO v_comment_author_id, v_profile_owner_id
  FROM public.profile_comments
  WHERE id = NEW.comment_id;

  -- Safety: if comment not found, do nothing
  IF v_comment_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Don't notify self-reaction
  IF v_comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert minimal notification fields that exist in profile_notifications
  INSERT INTO public.profile_notifications (
    user_id,
    actor_id,
    type,
    profile_user_id,
    comment_id,
    read
  ) VALUES (
    v_comment_author_id,
    NEW.user_id,
    'reaction',
    v_profile_owner_id,
    NEW.comment_id,
    false
  );

  RETURN NEW;
END;
$$;

-- 3) Update follow/unfollow notify functions to use existing columns only
CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_notifications (
    user_id,
    actor_id,
    type,
    profile_user_id,
    read
  ) VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    NEW.following_id,
    false
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_unfollow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_notifications (
    user_id,
    actor_id,
    type,
    profile_user_id,
    read
  ) VALUES (
    OLD.following_id,
    OLD.follower_id,
    'unfollow',
    OLD.following_id,
    false
  );
  RETURN OLD;
END;
$$;

-- 4) Ensure realtime works reliably (idempotent)
ALTER TABLE public.profile_comment_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.profile_follows REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_comment_reactions;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_follows;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;