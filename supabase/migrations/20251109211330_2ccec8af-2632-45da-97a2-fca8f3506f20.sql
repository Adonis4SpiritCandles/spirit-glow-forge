-- Create notifications for various events (fixed version)

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_actor_id UUID,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, actor_id, reference_id, metadata)
  VALUES (p_user_id, p_type, p_actor_id, p_reference_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new follower
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.followed_id,
    'follow',
    NEW.follower_id,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_new_follower ON profile_follows;
CREATE TRIGGER trigger_notify_new_follower
AFTER INSERT ON profile_follows
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();

-- Trigger for points gained
CREATE OR REPLACE FUNCTION notify_points_gained()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points_change > 0 THEN
    PERFORM create_notification(
      NEW.user_id,
      'points_gained',
      NEW.user_id,
      NEW.id,
      jsonb_build_object(
        'points', NEW.points_change,
        'reason', NEW.reason,
        'action_type', NEW.action_type
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_points_gained ON loyalty_points_history;
CREATE TRIGGER trigger_notify_points_gained
AFTER INSERT ON loyalty_points_history
FOR EACH ROW
EXECUTE FUNCTION notify_points_gained();

-- Trigger for badge earned
CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    'badge_earned',
    NEW.user_id,
    NEW.id,
    jsonb_build_object('badge_id', NEW.badge_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_badge_earned ON user_badges;
CREATE TRIGGER trigger_notify_badge_earned
AFTER INSERT ON user_badges
FOR EACH ROW
EXECUTE FUNCTION notify_badge_earned();

-- Trigger for order updates
CREATE OR REPLACE FUNCTION notify_order_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('paid', 'completed', 'shipped', 'cancelled') THEN
    PERFORM create_notification(
      NEW.user_id,
      'order_update',
      NEW.user_id,
      NEW.id,
      jsonb_build_object(
        'order_number', NEW.order_number,
        'status', NEW.status,
        'tracking_number', NEW.tracking_number
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_order_update ON orders;
CREATE TRIGGER trigger_notify_order_update
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_update();