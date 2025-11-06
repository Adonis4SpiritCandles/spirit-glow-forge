-- Migration per sistema commenti social completo

-- Aggiungi colonne per rating e statistiche ai commenti
ALTER TABLE profile_comments 
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES profile_comments(id) ON DELETE CASCADE;

-- Crea tabella per rating individuali dei commenti
CREATE TABLE IF NOT EXISTS profile_comment_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES profile_comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Abilita RLS
ALTER TABLE profile_comment_ratings ENABLE ROW LEVEL SECURITY;

-- Policy per leggere ratings
CREATE POLICY "Anyone can view comment ratings"
ON profile_comment_ratings FOR SELECT
USING (true);

-- Policy per inserire rating
CREATE POLICY "Authenticated users can rate comments"
ON profile_comment_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornare il proprio rating
CREATE POLICY "Users can update their own ratings"
ON profile_comment_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Policy per vedere risposte nested
CREATE POLICY "Anyone can view nested replies"
ON profile_comments FOR SELECT
USING (is_visible = true OR profile_user_id = auth.uid());

-- Aggiungi colonna per tracciare tag preferito nelle card prodotto
ALTER TABLE products
ADD COLUMN IF NOT EXISTS preferred_card_tag text DEFAULT 'category' CHECK (preferred_card_tag IN ('category', 'collection'));

-- Aggiungi colonna per tracciare referral source
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_source_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL;

-- Function per completare referral e assegnare punti
CREATE OR REPLACE FUNCTION complete_referral(
  referrer_user_id uuid,
  referee_user_id uuid
) RETURNS void AS $$
BEGIN
  -- Aggiorna referral status
  UPDATE referrals 
  SET status = 'completed', 
      reward_points = 200,
      updated_at = now()
  WHERE referrer_id = referrer_user_id 
    AND referee_id = referee_user_id
    AND status = 'pending';
  
  -- Aggiungi punti alla tabella loyalty_points
  INSERT INTO loyalty_points (user_id, points, lifetime_points)
  VALUES (referrer_user_id, 200, 200)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = loyalty_points.points + 200,
    lifetime_points = loyalty_points.lifetime_points + 200,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare average_rating quando viene aggiunto un rating
CREATE OR REPLACE FUNCTION update_comment_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profile_comments
  SET 
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM profile_comment_ratings
      WHERE comment_id = NEW.comment_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM profile_comment_ratings
      WHERE comment_id = NEW.comment_id
    )
  WHERE id = NEW.comment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON profile_comment_ratings
FOR EACH ROW
EXECUTE FUNCTION update_comment_rating();