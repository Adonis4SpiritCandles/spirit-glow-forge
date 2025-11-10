-- Fix create_notification to always set title and message
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_actor_id uuid,
  p_reference_id uuid DEFAULT NULL::uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_title text;
  v_message text;
  v_order_num text;
  v_status text;
  v_points int;
  v_reason text;
  v_badge text;
BEGIN
  -- Derive safe title and message based on type/metadata
  IF p_type = 'order_update' THEN
    v_title := 'Order update';
    v_order_num := p_metadata->>'order_number';
    v_status := p_metadata->>'status';
    v_message := 'Order #' || COALESCE(v_order_num, '—') || ' is now ' || COALESCE(v_status, 'updated');
  ELSIF p_type = 'points_gained' THEN
    v_title := 'Points earned';
    v_points := COALESCE((p_metadata->>'points')::int, 0);
    v_reason := p_metadata->>'reason';
    v_message := 'You earned ' || v_points || ' points' || CASE WHEN v_reason IS NOT NULL THEN ' (' || v_reason || ')' ELSE '' END;
  ELSIF p_type = 'badge_earned' THEN
    v_title := 'Badge earned';
    v_badge := p_metadata->>'badge_id';
    v_message := 'You earned the ' || COALESCE(v_badge, 'badge') || ' badge';
  ELSIF p_type = 'follow' THEN
    v_title := 'New follower';
    v_message := 'You have a new follower';
  ELSE
    v_title := initcap(replace(p_type, '_', ' '));
    v_message := COALESCE(p_metadata->>'message', p_type);
  END IF;

  INSERT INTO public.notifications (user_id, type, actor_id, reference_id, metadata, title, message)
  VALUES (
    p_user_id,
    p_type,
    p_actor_id,
    p_reference_id,
    COALESCE(p_metadata, '{}'::jsonb),
    COALESCE(v_title, 'Notification'),
    COALESCE(v_message, 'Notification')
  );
END;
$function$;