import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientId = Deno.env.get('FURGONETKA_CLIENT_ID');
    const clientSecret = Deno.env.get('FURGONETKA_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Missing Furgonetka credentials');
    }

    // Check if we have a valid token in database
    const { data: existingToken } = await supabase
      .from('furgonetka_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If token exists and not expired, return it
    if (existingToken && new Date(existingToken.expires_at) > new Date()) {
      console.log('Using existing valid token');
      return new Response(
        JSON.stringify({ access_token: existingToken.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get new token using client_credentials grant (recommended for server-to-server)
    console.log('Getting new token with client_credentials grant');
    
    // Use btoa for base64 encoding (Deno/Web API standard)
    const basic = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch('https://api.sandbox.furgonetka.pl/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'api',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Furgonetka auth error:', errorText);
      throw new Error(`Furgonetka authentication failed: ${errorText}`);
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Delete old tokens and insert new one
    await supabase.from('furgonetka_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const { error: insertError } = await supabase
      .from('furgonetka_tokens')
      .insert({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error saving token:', insertError);
    }

    console.log('New token obtained successfully');
    return new Response(
      JSON.stringify({ access_token: tokenData.access_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in get-furgonetka-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
