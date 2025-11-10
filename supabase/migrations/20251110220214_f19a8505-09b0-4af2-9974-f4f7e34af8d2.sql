-- ===================================
-- PHASE 6: Profile Comment Reactions
-- ===================================

-- Create profile_comment_reactions table for like/love/fire reactions
CREATE TABLE IF NOT EXISTS public.profile_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_profile_comment_reactions_comment ON public.profile_comment_reactions(comment_id);
CREATE INDEX idx_profile_comment_reactions_user ON public.profile_comment_reactions(user_id);
CREATE INDEX idx_profile_comment_reactions_type ON public.profile_comment_reactions(reaction_type);

-- Enable RLS
ALTER TABLE public.profile_comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reactions"
  ON public.profile_comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON public.profile_comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.profile_comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to notify comment author of reactions
CREATE OR REPLACE FUNCTION public.notify_comment_reaction()
RETURNS TRIGGER AS $$
DECLARE
  v_comment_author_id UUID;
  v_reactor_name TEXT;
  v_profile_owner_id UUID;
BEGIN
  -- Get comment author
  SELECT user_id, profile_user_id INTO v_comment_author_id, v_profile_owner_id
  FROM public.profile_comments
  WHERE id = NEW.comment_id;
  
  -- Don't notify if reacting to own comment
  IF v_comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get reactor's name
  SELECT COALESCE(display_name, email)
  INTO v_reactor_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  -- Create notification for comment author
  INSERT INTO public.profile_notifications (
    user_id,
    profile_user_id,
    actor_id,
    type,
    message_en,
    message_pl,
    reference_id
  ) VALUES (
    v_comment_author_id,
    v_profile_owner_id,
    NEW.user_id,
    'reaction',
    v_reactor_name || ' reacted ' || NEW.reaction_type || ' to your comment',
    v_reactor_name || ' zareagował ' || NEW.reaction_type || ' na Twój komentarz',
    NEW.comment_id::TEXT
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for reaction notifications
DROP TRIGGER IF EXISTS trigger_notify_comment_reaction ON public.profile_comment_reactions;
CREATE TRIGGER trigger_notify_comment_reaction
  AFTER INSERT ON public.profile_comment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_reaction();