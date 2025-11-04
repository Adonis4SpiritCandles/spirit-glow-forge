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

    // Check if REFERRAL10 already exists
    const { data: existing } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('code', 'REFERRAL10')
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: 'REFERRAL10 coupon already exists', coupon: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create REFERRAL10 coupon
    const { data: coupon, error } = await supabaseClient
      .from('coupons')
      .insert({
        code: 'REFERRAL10',
        description_en: 'Extra 10% off for referred users - combine with WELCOME10!',
        description_pl: 'Dodatkowe 10% zniżki dla poleconych użytkowników - łącz z WELCOME10!',
        percent_off: 10,
        active: true,
        per_user_limit: 1,
        referral_only: true
      })
      .select()
      .single();

    if (error) throw error;

    console.log('REFERRAL10 coupon created successfully:', coupon);

    return new Response(
      JSON.stringify({ success: true, coupon }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating REFERRAL10 coupon:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
