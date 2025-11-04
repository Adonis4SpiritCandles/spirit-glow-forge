-- FASE 2: Coupon System Enhancement
-- Add referral_only field to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS referral_only boolean DEFAULT false;

-- Create coupon_redemptions table to track usage
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_at timestamp with time zone DEFAULT now(),
  amount_saved_pln numeric,
  amount_saved_eur numeric,
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS on coupon_redemptions
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for coupon_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert redemptions"
  ON coupon_redemptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all redemptions"
  ON coupon_redemptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);

-- FASE 3: Referral System Enhancement
-- Add short_code to profiles for referral
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_short_code text UNIQUE;

-- Create index for short codes
CREATE INDEX IF NOT EXISTS idx_profiles_referral_short_code ON profiles(referral_short_code);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrals_count integer NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('points', 'badge', 'coupon')),
  reward_value text NOT NULL,
  description_en text,
  description_pl text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Everyone can view active rewards
CREATE POLICY "Everyone can view active referral rewards"
  ON referral_rewards FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage referral rewards"
  ON referral_rewards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default referral rewards
INSERT INTO referral_rewards (referrals_count, reward_type, reward_value, description_en, description_pl)
VALUES
  (3, 'badge', 'referral_master', 'Refer 3 friends to earn Referral Master badge', 'Poleć 3 znajomych, aby zdobyć odznakę Mistrz Polecających'),
  (5, 'points', '500', 'Refer 5 friends to earn 500 bonus points', 'Poleć 5 znajomych, aby zdobyć 500 punktów bonusowych'),
  (10, 'coupon', 'VIP10', 'Refer 10 friends to earn VIP10 coupon (15% off)', 'Poleć 10 znajomych, aby zdobyć kupon VIP10 (15% zniżki)')
ON CONFLICT DO NOTHING;

-- FASE 4: Badge Rewards
CREATE TABLE IF NOT EXISTS badge_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id text NOT NULL UNIQUE,
  reward_type text NOT NULL CHECK (reward_type IN ('points', 'coupon', 'discount')),
  reward_value text NOT NULL,
  description_en text,
  description_pl text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE badge_rewards ENABLE ROW LEVEL SECURITY;

-- Everyone can view active badge rewards
CREATE POLICY "Everyone can view active badge rewards"
  ON badge_rewards FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage badge rewards"
  ON badge_rewards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default badge rewards
INSERT INTO badge_rewards (badge_id, reward_type, reward_value, description_en, description_pl)
VALUES
  ('first_order', 'points', '50', 'Earn 50 bonus points on your first order', 'Zdobądź 50 punktów bonusowych przy pierwszym zamówieniu'),
  ('loyal_customer', 'coupon', 'LOYAL15', 'Unlock LOYAL15 coupon (15% off) for 5+ orders', 'Odblokuj kupon LOYAL15 (15% zniżki) po 5+ zamówieniach'),
  ('super_reviewer', 'points', '100', 'Earn 100 bonus points for 10+ reviews', 'Zdobądź 100 punktów bonusowych za 10+ recenzji')
ON CONFLICT DO NOTHING;

-- FASE 5: User Profile Enhancements
-- Add profile and cover image fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile boolean DEFAULT false;

-- Create profile_comments table for public profiles
CREATE TABLE IF NOT EXISTS profile_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id uuid NOT NULL,
  commenter_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_visible boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE profile_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view visible comments"
  ON profile_comments FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can create comments"
  ON profile_comments FOR INSERT
  WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can update their own comments"
  ON profile_comments FOR UPDATE
  USING (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments"
  ON profile_comments FOR DELETE
  USING (auth.uid() = commenter_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_comments_profile ON profile_comments(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_commenter ON profile_comments(commenter_id);

-- FASE 6: Email Templates Management
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_pl text NOT NULL,
  subject_en text NOT NULL,
  subject_pl text NOT NULL,
  description_en text,
  description_pl text,
  is_active boolean DEFAULT true,
  edge_function_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_sent_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default email templates
INSERT INTO email_templates (template_key, name_en, name_pl, subject_en, subject_pl, description_en, description_pl, edge_function_name)
VALUES
  ('order_confirmation', 'Order Confirmation', 'Potwierdzenie Zamówienia', 'Your Spirit Candles Order #{orderNumber}', 'Twoje zamówienie Spirit Candles #{orderNumber}', 'Sent when order is placed', 'Wysyłane po złożeniu zamówienia', 'send-order-confirmation'),
  ('order_accepted', 'Order Accepted', 'Zamówienie Zaakceptowane', 'Your order is being prepared', 'Twoje zamówienie jest przygotowywane', 'Sent when admin accepts order', 'Wysyłane gdy admin akceptuje zamówienie', 'send-order-accepted'),
  ('tracking_available', 'Tracking Available', 'Dostępne Śledzenie', 'Track your Spirit Candles package', 'Śledź swoją paczkę Spirit Candles', 'Sent when tracking becomes available', 'Wysyłane gdy śledzenie staje się dostępne', 'send-tracking-available'),
  ('order_completed', 'Order Completed', 'Zamówienie Zrealizowane', 'Your order has been completed', 'Twoje zamówienie zostało zrealizowane', 'Sent when order is marked complete', 'Wysyłane gdy zamówienie jest oznaczone jako zrealizowane', 'send-status-update'),
  ('registration_welcome', 'Registration Welcome', 'Powitanie Po Rejestracji', 'Welcome to Spirit Candles', 'Witamy w Spirit Candles', 'Sent after successful registration', 'Wysyłane po udanej rejestracji', 'send-registration-welcome'),
  ('referral_success', 'Referral Success', 'Sukces Polecenia', 'You earned referral rewards!', 'Zdobyłeś nagrody za polecenie!', 'Sent when referral is successful', 'Wysyłane gdy polecenie jest udane', 'send-referral-emails'),
  ('newsletter_confirmation', 'Newsletter Confirmation', 'Potwierdzenie Newsletter', 'Confirm your newsletter subscription', 'Potwierdź subskrypcję newsletter', 'Double opt-in confirmation', 'Potwierdzenie double opt-in', 'newsletter-confirm')
ON CONFLICT DO NOTHING;