-- Create profile notifications table for comment/reply/like notifications
CREATE TABLE IF NOT EXISTS public.profile_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'like', 'rating')),
  profile_user_id UUID,
  comment_id UUID REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profile_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.profile_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.profile_notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.profile_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_notifications_user_id ON public.profile_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_notifications_read ON public.profile_notifications(user_id, read);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_profile_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user is commenting on their own profile
  IF NEW.commenter_id = NEW.profile_user_id THEN
    RETURN NEW;
  END IF;

  -- Create notification for profile owner when someone comments
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NULL THEN
    INSERT INTO public.profile_notifications (user_id, type, profile_user_id, comment_id, actor_id)
    VALUES (NEW.profile_user_id, 'comment', NEW.profile_user_id, NEW.id, NEW.commenter_id);
  END IF;

  -- Create notification for comment owner when someone replies
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    -- Get the parent comment owner
    DECLARE
      parent_commenter_id UUID;
    BEGIN
      SELECT commenter_id INTO parent_commenter_id
      FROM public.profile_comments
      WHERE id = NEW.parent_comment_id;

      -- Don't notify if replying to own comment
      IF parent_commenter_id != NEW.commenter_id THEN
        INSERT INTO public.profile_notifications (user_id, type, profile_user_id, comment_id, actor_id)
        VALUES (parent_commenter_id, 'reply', NEW.profile_user_id, NEW.parent_comment_id, NEW.commenter_id);
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for comment notifications
CREATE TRIGGER trigger_create_comment_notification
  AFTER INSERT ON public.profile_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_notification();

-- Function to notify on likes
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  comment_owner_id UUID;
BEGIN
  -- Get comment owner
  SELECT commenter_id INTO comment_owner_id
  FROM public.profile_comments
  WHERE id = NEW.comment_id;

  -- Don't notify if user likes their own comment
  IF comment_owner_id != NEW.user_id THEN
    INSERT INTO public.profile_notifications (user_id, type, comment_id, actor_id)
    VALUES (comment_owner_id, 'like', NEW.comment_id, NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for like notifications
CREATE TRIGGER trigger_create_like_notification
  AFTER INSERT ON public.profile_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();