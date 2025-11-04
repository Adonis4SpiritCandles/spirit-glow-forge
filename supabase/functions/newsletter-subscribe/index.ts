import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
  name?: string;
  language?: 'en' | 'pl';
  source?: 'footer' | 'signup' | 'contact' | 'admin';
  consent: boolean;
  consent_text?: string;
  ip?: string;
  ua?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const { email, name, language = 'en', source = 'footer', consent, consent_text, ip, ua }: SubscribeRequest = rawData;

    // ===== SERVER-SIDE INPUT VALIDATION =====
    if (!email || !consent) {
      throw new Error('Email and consent are required');
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate lengths
    if (email.length > 255) throw new Error('Email must be less than 255 characters');
    if (name && name.length > 100) throw new Error('Name must be less than 100 characters');
    if (consent_text && consent_text.length > 500) throw new Error('Consent text too long');

    // Validate language
    if (!['en', 'pl'].includes(language)) {
      throw new Error('Invalid language. Must be "en" or "pl"');
    }

    // Validate source
    const validSources = ['footer', 'signup', 'contact', 'admin'];
    if (!validSources.includes(source)) {
      throw new Error('Invalid source');
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name?.trim().replace(/<[^>]*>/g, '') || null;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = crypto.randomUUID();
    const confirmUrl = `https://spirit-candle.com/newsletter/confirm?token=${token}`;

    // Insert/update subscriber using sanitized inputs
    const { error: upsertError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: sanitizedEmail,
        name: sanitizedName,
        language,
        source,
        consent,
        consent_text: consent_text || `Subscribed via ${source}`,
        consent_ip: ip || null,
        user_agent: ua || null,
        double_opt_in_token: token,
        status: 'pending',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (upsertError) throw upsertError;

    console.log(`[Newsletter Subscribe] Sending confirmation email to ${sanitizedEmail}`);

    // Send confirmation email using sanitized inputs
    const isPl = language === 'pl';
    const { error: emailError } = await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [sanitizedEmail],
      subject: isPl ? 'Potwierdź subskrypcję newslettera 📧' : 'Confirm your newsletter subscription 📧',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}</style>
          </head>
          <body style="background-color:#f4f4f4;padding:20px;">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align:center;margin-bottom:30px;">
                <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" alt="Spirit Candles" style="width:150px;">
              </div>
              <h1 style="color:#d4af37;text-align:center;">
                ${isPl ? '✨ Witaj w Spirit Candles!' : '✨ Welcome to Spirit Candles!'}
              </h1>
              <p style="font-size:16px;color:#333;">
                ${isPl ? `Cześć ${sanitizedName || 'tam'},` : `Hi ${sanitizedName || 'there'},`}
              </p>
              <p style="font-size:16px;color:#666;">
                ${isPl 
                  ? 'Dziękujemy za zainteresowanie naszym newsletterem! Kliknij przycisk poniżej, aby potwierdzić swoją subskrypcję i otrzymać <strong>10% zniżki</strong> na pierwsze zamówienie.'
                  : 'Thank you for your interest in our newsletter! Click the button below to confirm your subscription and receive <strong>10% off</strong> your first order.'}
              </p>
              <div style="text-align:center;margin:40px 0;">
                <a href="${confirmUrl}" style="display:inline-block;background:#d4af37;color:#fff;padding:15px 40px;text-decoration:none;border-radius:5px;font-size:18px;font-weight:bold;">
                  ${isPl ? '✓ Potwierdź Subskrypcję' : '✓ Confirm Subscription'}
                </a>
              </div>
              <p style="font-size:14px;color:#999;text-align:center;margin-top:30px;">
                ${isPl 
                  ? 'Jeśli nie zamawiałeś tego emaila, możesz go zignorować.'
                  : 'If you didn\'t request this email, you can safely ignore it.'}
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
              <p style="font-size:12px;color:#999;text-align:center;">
                Spirit Candles | Grzybowska 2/31, 00-131 Warszawa | m5moffice@proton.me
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('[Newsletter Subscribe] Email error:', emailError);
      throw emailError;
    }

    console.log(`[Newsletter Subscribe] Confirmation email sent to ${sanitizedEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: isPl 
          ? 'Sprawdź swoją skrzynkę mailową, aby potwierdzić subskrypcję!'
          : 'Check your email to confirm your subscription!'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('[Newsletter Subscribe] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
