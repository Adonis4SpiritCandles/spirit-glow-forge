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
      // Non bloccare, ma loggare l'errore
      // I punti potrebbero essere già stati aggiunti dal trigger o dalla funzione
    } else {
      console.log('Complete referral function executed - 200 points awarded to referrer');
      
      // Log points history for referrer (con gestione errori)
      try {
        const { error: historyError } = await supabaseAdmin
          .from('loyalty_points_history')
          .insert({
            user_id: referrer_id,
            points_change: 200,
            reason: `Referred ${refereeName} (${refereeEmail})`,
            action_type: 'earn',
            reference_type: 'referral',
            reference_id: referee_id
          });
        
        if (historyError) {
          console.warn('Error logging points history (non-critical):', historyError);
        }
      } catch (historyErr) {
        console.warn('Exception logging points history (non-critical):', historyErr);
      }
    }

    // Step 5: Update referee's profile with referral_source_id
    // Nota: referral_source_id potrebbe essere già stato salvato dal trigger handle_new_user
    // Controlliamo prima se è già impostato
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('referral_source_id')
      .eq('user_id', referee_id)
      .single();

    // Aggiorna solo se non è già impostato o se è diverso
    if (!currentProfile?.referral_source_id || currentProfile.referral_source_id !== referrer_id) {
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ referral_source_id: referrer_id })
        .eq('user_id', referee_id);

      if (profileUpdateError) {
        console.error('Error updating referee profile with referral_source_id:', profileUpdateError);
        // Non bloccare, ma loggare
      } else {
        console.log('Referee profile updated with referral_source_id:', referrer_id);
      }
    } else {
      console.log('Referee profile already has referral_source_id:', currentProfile.referral_source_id);
    }

    // Step 6: Award welcome points to referee (100 points)
    // Verifica se i punti sono già stati assegnati (idempotency)
    const { data: existingPoints, error: pointsCheckError } = await supabaseAdmin
      .from('loyalty_points')
      .select('*')
      .eq('user_id', referee_id)
      .single();

    if (pointsCheckError && pointsCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, che è normale se non ci sono punti ancora
      console.error('Error checking existing points:', pointsCheckError);
    } else {
      if (existingPoints) {
        const { error: updateError } = await supabaseAdmin
          .from('loyalty_points')
          .update({
            points: (existingPoints.points || 0) + 100,
            lifetime_points: (existingPoints.lifetime_points || 0) + 100,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referee_id);
        
        if (updateError) {
          console.error('Error updating referee loyalty points:', updateError);
        } else {
          console.log('Welcome points (100) added to referee existing balance');
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('loyalty_points')
          .insert({
            user_id: referee_id,
            points: 100,
            lifetime_points: 100
          });
        
        if (insertError) {
          console.error('Error inserting referee loyalty points:', insertError);
        } else {
          console.log('Welcome points (100) created for referee');
        }
      }
      
      // Log points history for referee (con gestione errori)
      try {
        const { error: historyError } = await supabaseAdmin
          .from('loyalty_points_history')
          .insert({
            user_id: referee_id,
            points_change: 100,
            reason: 'Welcome bonus - registered via referral',
            action_type: 'bonus',
            reference_type: 'referral',
            reference_id: referrer_id
          });
        
        if (historyError) {
          console.warn('Error logging referee points history (non-critical):', historyError);
        }
      } catch (historyErr) {
        console.warn('Exception logging referee points history (non-critical):', historyErr);
      }
    }

    // Step 7: Assign badges (con gestione errori migliorata)
    try {
      const { error: badgeError } = await supabaseAdmin
        .from('user_badges')
        .insert([
          { user_id: referrer_id, badge_id: 'referral_inviter' },
          { user_id: referee_id, badge_id: 'welcome' }
        ]);
      
      if (badgeError) {
        // Expected: potrebbe essere un conflitto se badge già assegnato
        if (badgeError.code === '23505' || badgeError.message?.includes('duplicate')) {
          console.log('Badges already assigned (expected):', badgeError.message);
        } else {
          console.warn('Error assigning badges (non-critical):', badgeError);
        }
      } else {
        console.log('Badges assigned successfully');
      }
    } catch (badgeErr) {
      console.warn('Exception assigning badges (non-critical):', badgeErr);
    }

    // Step 8: Get referrer profile for emails
    const { data: referrerProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, preferred_language')
      .eq('user_id', referrer_id)
      .single();

    if (referrerProfile) {
      // Send referral emails (non-blocking)
      supabaseAdmin.functions.invoke('send-referral-emails', {
        body: {
          referrerEmail: referrerProfile.email,
          referrerName: referrerProfile.first_name || 'Friend',
          refereeName: refereeName,
          refereeEmail: refereeEmail,
          language: referrerProfile.preferred_language || 'en'
        }
      })
      .then(({ error: emailErr }) => {
        if (emailErr) {
          console.error('Failed to send referral emails:', emailErr);
        } else {
          console.log('Referral emails sent successfully');
        }
      })
      .catch((emailErr) => {
        console.error('Exception sending referral emails:', emailErr);
      });

      // Process referral rewards (check thresholds for badges/coupons) - non-blocking
      supabaseAdmin.functions.invoke('process-referral-rewards', {
        body: { referrerId: referrer_id }
      })
      .then(({ error: rewardErr }) => {
        if (rewardErr) {
          console.error('Failed to process referral rewards:', rewardErr);
        } else {
          console.log('Referral rewards processed');
        }
      })
      .catch((rewardErr) => {
        console.error('Exception processing referral rewards:', rewardErr);
      });
    } else {
      console.warn('Referrer profile not found, skipping email and rewards processing');
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
