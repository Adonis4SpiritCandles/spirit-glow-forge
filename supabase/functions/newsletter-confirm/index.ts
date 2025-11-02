import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.redirect('https://spirit-candle.com/?newsletter=error', 302);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('double_opt_in_token', token)
      .single();

    if (findError || !subscriber) {
      console.error('[Newsletter Confirm] Token not found:', token);
      return Response.redirect('https://spirit-candle.com/?newsletter=invalid', 302);
    }

    // Update subscriber status
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        confirmed_at: new Date().toISOString(),
        double_opt_in_token: null
      })
      .eq('double_opt_in_token', token);

    if (updateError) throw updateError;

    console.log(`[Newsletter Confirm] Subscriber confirmed: ${subscriber.email}`);

    // Send welcome email with discount code
    await fetch(`${supabaseUrl}/functions/v1/send-welcome-newsletter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
        name: subscriber.name || subscriber.email.split('@')[0]
      })
    });

    return Response.redirect('https://spirit-candle.com/?newsletter=success', 302);
  } catch (error: any) {
    console.error('[Newsletter Confirm] Error:', error);
    return Response.redirect('https://spirit-candle.com/?newsletter=error', 302);
  }
});
