import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referrerId } = await req.json();

    // Count completed referrals for this user
    const { data: referrals, error: referralsError } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referrer_id', referrerId)
      .eq('status', 'completed');

    if (referralsError) throw referralsError;

    const referralCount = referrals?.length || 0;

    // Get active referral rewards
    const { data: rewards, error: rewardsError } = await supabaseClient
      .from('referral_rewards')
      .select('*')
      .eq('is_active', true)
      .lte('referrals_count', referralCount)
      .order('referrals_count', { ascending: false });

    if (rewardsError) throw rewardsError;

    console.log(`User ${referrerId} has ${referralCount} referrals, checking rewards...`);

    // Process rewards
    for (const reward of rewards || []) {
      if (referralCount >= reward.referrals_count) {
        console.log(`Applying reward: ${reward.reward_type} - ${reward.reward_value}`);

        // Apply reward based on type
        if (reward.reward_type === 'points') {
          const points = parseInt(reward.reward_value);
          
          // Get or create loyalty points
          const { data: loyaltyData } = await supabaseClient
            .from('loyalty_points')
            .select('*')
            .eq('user_id', referrerId)
            .single();

          if (loyaltyData) {
            await supabaseClient
              .from('loyalty_points')
              .update({
                points: loyaltyData.points + points,
                lifetime_points: loyaltyData.lifetime_points + points
              })
              .eq('user_id', referrerId);
          } else {
            await supabaseClient
              .from('loyalty_points')
              .insert({
                user_id: referrerId,
                points: points,
                lifetime_points: points
              });
          }
        } else if (reward.reward_type === 'coupon') {
          // Generate unique coupon code for user
          // This would need coupon generation logic
          console.log(`Should generate coupon: ${reward.reward_value}`);
        }
      }
    }

    // Assign badge if milestone reached
    if (referralCount >= 1) {
      await supabaseClient
        .from('user_badges')
        .insert({
          user_id: referrerId,
          badge_id: 'social_butterfly'
        })
        .select()
        .single()
        .then(() => console.log('Badge assigned: social_butterfly'))
        .catch((err) => {
          if (!err.message.includes('duplicate')) {
            console.error('Error assigning badge:', err);
          }
        });
    }

    // Send milestone email notifications
    const milestones = [3, 5, 10];
    if (milestones.includes(referralCount)) {
      console.log(`Milestone reached: ${referralCount} referrals`);
      
      // Find the reward for this milestone
      const milestoneReward = rewards?.find(r => r.referrals_count === referralCount);
      
      if (milestoneReward) {
        try {
          await supabaseClient.functions.invoke('send-referral-milestone', {
            body: {
              referrerId,
              milestone: referralCount,
              rewardType: milestoneReward.reward_type,
              rewardValue: milestoneReward.reward_value
            }
          });
          console.log(`Milestone email sent for ${referralCount} referrals`);
        } catch (emailError) {
          console.error('Error sending milestone email:', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        referralCount,
        rewardsApplied: rewards?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing referral rewards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
