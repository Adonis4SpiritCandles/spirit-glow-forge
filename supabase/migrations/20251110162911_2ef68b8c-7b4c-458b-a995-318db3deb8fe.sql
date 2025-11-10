-- Create RPC function for leaderboard
CREATE OR REPLACE FUNCTION get_spirit_leaderboard(time_period text, limit_count integer)
RETURNS TABLE (
  user_id uuid,
  total_referrals bigint,
  total_points bigint,
  rank bigint,
  profile jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH referral_stats AS (
    SELECT 
      r.referrer_id,
      COUNT(*) FILTER (WHERE r.status = 'completed') as completed_referrals,
      COALESCE(SUM(r.reward_points) FILTER (WHERE r.status = 'completed'), 0) as points,
      CASE 
        WHEN time_period = 'week' THEN r.created_at >= NOW() - INTERVAL '7 days'
        WHEN time_period = 'month' THEN r.created_at >= NOW() - INTERVAL '30 days'
        ELSE true
      END as in_period
    FROM referrals r
    WHERE r.status = 'completed'
    GROUP BY r.referrer_id
    HAVING CASE 
      WHEN time_period = 'week' THEN bool_or(r.created_at >= NOW() - INTERVAL '7 days')
      WHEN time_period = 'month' THEN bool_or(r.created_at >= NOW() - INTERVAL '30 days')
      ELSE true
    END
  )
  SELECT 
    rs.referrer_id as user_id,
    rs.completed_referrals as total_referrals,
    rs.points as total_points,
    RANK() OVER (ORDER BY rs.points DESC, rs.completed_referrals DESC) as rank,
    jsonb_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name,
      'username', p.username,
      'profile_image_url', p.profile_image_url
    ) as profile
  FROM referral_stats rs
  JOIN profiles p ON p.user_id = rs.referrer_id
  WHERE p.public_profile = true
  ORDER BY rank
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;