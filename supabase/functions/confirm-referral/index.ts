import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmReferralRequest {
  referee_id: string;
  referral_code_or_id: string;
  preferredLanguage: string;
  refereeEmail: string;
  refereeName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      referee_id,
      referral_code_or_id,
      preferredLanguage,
      refereeEmail,
      refereeName
    }: ConfirmReferralRequest = await req.json();

    console.log(`Processing referral for referee ${referee_id} with code: ${referral_code_or_id}`);

    // Step 1: Resolve referral_code_or_id to referrer_id
    let referrer_id: string | null = null;

    // Check if it's an 8-character short code
    if (referral_code_or_id.match(/^[A-Za-z0-9]{8}$/)) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('referral_short_code', referral_code_or_id.toUpperCase())
        .single();

      if (profileError || !profileData) {
        console.error('Invalid short code:', referral_code_or_id);
        return new Response(
          JSON.stringify({ error: 'Invalid referral code' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      referrer_id = profileData.user_id;
    }
    // Check if it's a UUID
    else if (referral_code_or_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Verify UUID exists in profiles
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('user_id', referral_code_or_id)
        .single();

      if (profileError || !profileData) {
        console.error('Invalid referrer UUID:', referral_code_or_id);
        return new Response(
          JSON.stringify({ error: 'Invalid referral link' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      referrer_id = referral_code_or_id;
    } else {
      console.error('Invalid referral format:', referral_code_or_id);
      return new Response(
        JSON.stringify({ error: 'Invalid referral format' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Prevent self-referral
    if (referrer_id === referee_id) {
      console.error('User attempted self-referral');
      return new Response(
        JSON.stringify({ error: 'Cannot refer yourself' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Resolved referrer_id: ${referrer_id}`);

    // Step 2: Check for existing referral (idempotency)
    const { data: existingReferral } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer_id)
      .eq('referee_id', referee_id)
      .single();

    if (existingReferral) {
      console.log('Referral already processed, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Referral already processed', referrerId: referrer_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Step 3: Insert referral record
    const { error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id,
        referee_id,
        referee_email: refereeEmail,
        status: 'completed',
        reward_points: 200
      });

    if (referralError) {
      console.error('Error creating referral:', referralError);
      throw new Error('Failed to create referral record');
    }

    console.log('Referral record created successfully');

    // Step 4: Execute complete_referral function (awards 200 points to referrer)
    const { error: rpcError } = await supabaseAdmin.rpc('complete_referral', {
      referrer_user_id: referrer_id,
      referee_user_id: referee_id
    });

    if (rpcError) {
      console.error('Error executing complete_referral:', rpcError);
    } else {
      console.log('Complete referral function executed - 200 points awarded to referrer');
    }

    // Step 5: Update referee's profile with referral_source_id
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ referral_source_id: referrer_id })
      .eq('user_id', referee_id);

    if (profileUpdateError) {
      console.error('Error updating referee profile:', profileUpdateError);
    } else {
      console.log('Referee profile updated with referral_source_id');
    }

    // Step 6: Award welcome points to referee (100 points)
    const { data: existingPoints } = await supabaseAdmin
      .from('loyalty_points')
      .select('*')
      .eq('user_id', referee_id)
      .single();

    if (existingPoints) {
      await supabaseAdmin
        .from('loyalty_points')
        .update({
          points: (existingPoints.points || 0) + 100,
          lifetime_points: (existingPoints.lifetime_points || 0) + 100
        })
        .eq('user_id', referee_id);
    } else {
      await supabaseAdmin
        .from('loyalty_points')
        .insert({
          user_id: referee_id,
          points: 100,
          lifetime_points: 100
        });
    }

    console.log('Welcome points (100) awarded to referee');

    // Step 7: Assign badges
    await supabaseAdmin
      .from('user_badges')
      .insert([
        { user_id: referrer_id, badge_id: 'referral_inviter' },
        { user_id: referee_id, badge_id: 'welcome' }
      ])
      .then(({ error }) => {
        if (error) {
          console.log('Badge assignment (expected conflicts):', error.message);
        } else {
          console.log('Badges assigned successfully');
        }
      });

    // Step 8: Get referrer profile for emails
    const { data: referrerProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, preferred_language')
      .eq('user_id', referrer_id)
      .single();

    if (referrerProfile) {
      // Send referral emails
      try {
        await supabaseAdmin.functions.invoke('send-referral-emails', {
          body: {
            referrerEmail: referrerProfile.email,
            referrerName: referrerProfile.first_name || 'Friend',
            refereeName: refereeName,
            refereeEmail: refereeEmail,
            language: referrerProfile.preferred_language || 'en'
          }
        });
        console.log('Referral emails sent successfully');
      } catch (emailErr) {
        console.error('Failed to send referral emails:', emailErr);
      }

      // Process referral rewards (check thresholds for badges/coupons)
      try {
        await supabaseAdmin.functions.invoke('process-referral-rewards', {
          body: { referrerId: referrer_id }
        });
        console.log('Referral rewards processed');
      } catch (rewardErr) {
        console.error('Failed to process referral rewards:', rewardErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        referrerId: referrer_id,
        message: 'Referral confirmed successfully'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error confirming referral:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
