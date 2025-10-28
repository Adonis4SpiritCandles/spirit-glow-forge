-- Create trigger function to assign first_order badge
CREATE OR REPLACE FUNCTION assign_first_order_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the user's first completed order
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if user doesn't already have the badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = NEW.user_id 
      AND badge_id = 'first_order'
    ) THEN
      -- Assign the badge
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, 'first_order')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for loyal_customer badge (5+ orders)
    IF (
      SELECT COUNT(*) 
      FROM orders 
      WHERE user_id = NEW.user_id 
      AND status = 'completed'
    ) >= 5 THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, 'loyal_customer')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS assign_badges_on_order ON orders;
CREATE TRIGGER assign_badges_on_order
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_first_order_badge();

-- Create trigger function for review badges
CREATE OR REPLACE FUNCTION assign_review_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has 10+ reviews
  IF (
    SELECT COUNT(*) 
    FROM reviews 
    WHERE user_id = NEW.user_id
  ) >= 10 THEN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (NEW.user_id, 'super_reviewer')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on reviews table
DROP TRIGGER IF EXISTS assign_badges_on_review ON reviews;
CREATE TRIGGER assign_badges_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION assign_review_badge();