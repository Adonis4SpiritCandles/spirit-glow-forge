import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate random 8-character alphanumeric code
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user already has a short code
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_short_code')
      .eq('user_id', user.id)
      .single();

    if (profile?.referral_short_code) {
      return new Response(
        JSON.stringify({ code: profile.referral_short_code, existed: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate unique code
    let attempts = 0;
    let code: string;
    let isUnique = false;

    while (!isUnique && attempts < 10) {
      code = generateShortCode();
      
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_short_code', code)
        .single();

      if (!existing) {
        isUnique = true;
        
        // Update user profile with new code
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ referral_short_code: code })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ code, existed: false }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      attempts++;
    }

    throw new Error('Failed to generate unique code');
  } catch (error: any) {
    console.error('[Generate Referral Code] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
