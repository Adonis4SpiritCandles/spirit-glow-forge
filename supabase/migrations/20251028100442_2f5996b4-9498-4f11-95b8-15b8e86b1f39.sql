-- Create chat_messages table for live chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_badges table for gamification
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  referee_email TEXT NOT NULL,
  referee_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_points INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shared_wishlists table
CREATE TABLE public.shared_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  name TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to wishlist table
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS collection TEXT DEFAULT 'default';
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS price_alert_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.wishlist ADD COLUMN IF NOT EXISTS stock_alert_enabled BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_wishlists ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id OR sender = 'bot');

CREATE POLICY "Users can create their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages"
  ON public.chat_messages FOR SELECT
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can create admin messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (get_current_user_role() = 'admin' AND sender = 'admin');

-- User badges policies
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage badges"
  ON public.user_badges FOR ALL
  USING (true);

-- Referrals policies
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Shared wishlists policies
CREATE POLICY "Users can manage their own shared wishlists"
  ON public.shared_wishlists FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public wishlists"
  ON public.shared_wishlists FOR SELECT
  USING (is_public = true);

-- Indexes
CREATE INDEX idx_chat_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_user ON public.chat_messages(user_id);
CREATE INDEX idx_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_shared_wishlists_token ON public.shared_wishlists(share_token);