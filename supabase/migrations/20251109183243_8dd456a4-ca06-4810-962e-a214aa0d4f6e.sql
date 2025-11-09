-- Fix search_path for security on all functions

-- 1. complete_referral - SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.complete_referral(referrer_user_id uuid, referee_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update referral status
  UPDATE referrals 
  SET status = 'completed', 
      reward_points = 200,
      updated_at = NOW()
  WHERE referrer_id = referrer_user_id 
    AND referee_id = referee_user_id
    AND status = 'pending';
  
  -- Add points to loyalty_points table
  INSERT INTO loyalty_points (user_id, points, lifetime_points)
  VALUES (referrer_user_id, 200, 200)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = loyalty_points.points + 200,
    lifetime_points = loyalty_points.lifetime_points + 200,
    updated_at = NOW();
END;
$function$;

-- 2. update_comment_rating - trigger function
CREATE OR REPLACE FUNCTION public.update_comment_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
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
$function$;

-- 3. update_updated_at_column - trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 4. validate_email - immutable function
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;