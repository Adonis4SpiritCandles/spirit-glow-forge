-- Add target_language parameter to create_notification function for localization
-- and populate action_url based on notification type

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_actor_id uuid DEFAULT NULL,
  p_reference_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_target_language text DEFAULT 'en'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_type text;
  v_title text;
  v_message text;
  v_action_url text;
BEGIN
  -- Normalize type to match CHECK constraint
  v_normalized_type := CASE p_type
    WHEN 'order_update' THEN 'order'
    WHEN 'tracking_update' THEN 'tracking'
    WHEN 'follow' THEN 'message'
    WHEN 'points_gained' THEN 'general'
    WHEN 'badge_earned' THEN 'general'
    WHEN 'referral' THEN 'referral'
    ELSE 'general'
  END;

  -- Set action_url based on normalized type
  v_action_url := CASE v_normalized_type
    WHEN 'order' THEN '/dashboard'
    WHEN 'tracking' THEN '/dashboard'
    WHEN 'referral' THEN '/loyalty'
    WHEN 'message' THEN CASE WHEN p_actor_id IS NOT NULL THEN '/profile/' || p_actor_id ELSE NULL END
    ELSE NULL
  END;

  -- Localized title based on original p_type and language
  v_title := CASE 
    WHEN p_type = 'order_update' THEN
      CASE p_target_language 
        WHEN 'pl' THEN 'Aktualizacja zamówienia'
        ELSE 'Order update'
      END
    WHEN p_type = 'tracking_update' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Aktualizacja śledzenia'
        ELSE 'Tracking update'
      END
    WHEN p_type = 'points_gained' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Zdobyte punkty'
        ELSE 'Points earned'
      END
    WHEN p_type = 'badge_earned' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Odznaka zdobyta'
        ELSE 'Badge earned'
      END
    WHEN p_type = 'follow' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Nowy obserwujący'
        ELSE 'New follower'
      END
    WHEN p_type = 'referral' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Polecenie'
        ELSE 'Referral'
      END
    ELSE
      CASE p_target_language
        WHEN 'pl' THEN 'Powiadomienie'
        ELSE 'Notification'
      END
  END;

  -- Localized message based on original p_type and language
  v_message := CASE 
    WHEN p_type = 'order_update' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Twoje zamówienie zostało zaktualizowane'
        ELSE 'Your order has been updated'
      END
    WHEN p_type = 'tracking_update' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Dostępna jest nowa informacja o śledzeniu'
        ELSE 'New tracking information is available'
      END
    WHEN p_type = 'points_gained' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Zdobyłeś punkty Spirit'
        ELSE 'You earned Spirit points'
      END
    WHEN p_type = 'badge_earned' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Zdobyłeś nową odznakę'
        ELSE 'You earned a new badge'
      END
    WHEN p_type = 'follow' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Ktoś zaczął Cię obserwować'
        ELSE 'Someone started following you'
      END
    WHEN p_type = 'referral' THEN
      CASE p_target_language
        WHEN 'pl' THEN 'Aktualizacja polecenia'
        ELSE 'Referral update'
      END
    ELSE
      CASE p_target_language
        WHEN 'pl' THEN 'Masz nowe powiadomienie'
        ELSE 'You have a new notification'
      END
  END;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    reference_id,
    metadata,
    action_url
  ) VALUES (
    p_user_id,
    v_normalized_type,
    v_title,
    v_message,
    p_actor_id,
    p_reference_id,
    p_metadata,
    v_action_url
  );
END;
$$;