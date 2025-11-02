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

interface ContactRequest {
  name: string;
  email: string;
  category?: string;
  subject?: string;
  message: string;
  newsletterConsent?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, category, subject, message, newsletterConsent }: ContactRequest = await req.json();

    if (!name || !email || !message) {
      throw new Error('Missing required fields: name, email, message');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const isDataRequest = category === 'Data Request';

    console.log(`[Contact Form] Processing ${isDataRequest ? 'data request' : 'contact message'} from ${email}`);

    // Save to database
    if (isDataRequest) {
      const requestType = subject?.includes('access') ? 'access' :
                         subject?.includes('rectification') ? 'rectification' :
                         subject?.includes('erasure') ? 'erasure' :
                         subject?.includes('portability') ? 'portability' :
                         subject?.includes('restriction') ? 'restriction' :
                         subject?.includes('objection') ? 'objection' : 'consent_withdrawal';

      await supabase.from('data_requests').insert({
        name,
        email: email.toLowerCase().trim(),
        request_type: requestType,
        details: message,
        status: 'pending'
      });
    } else {
      await supabase.from('contact_messages').insert({
        name,
        email: email.toLowerCase().trim(),
        category: category || 'generic',
        subject: subject || 'No subject',
        message,
        newsletter_consent: newsletterConsent || false
      });
    }

    // Send email to admin
    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: ['m5moffice@proton.me'],
      reply_to: email,
      subject: subject || `${isDataRequest ? '[GDPR REQUEST]' : '[CONTACT]'} New message from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><style>body{font-family:Arial;line-height:1.6;}</style></head>
          <body style="padding:20px;">
            <h2>${isDataRequest ? '🔒 GDPR Data Request' : '📧 New Contact Message'}</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Category:</strong> ${category || 'N/A'}</p>
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
            <hr>
            <p><strong>Message:</strong></p>
            <p style="background:#f5f5f5;padding:15px;border-left:4px solid #d4af37;">${message.replace(/\n/g, '<br>')}</p>
            ${newsletterConsent ? '<p>✓ <em>User wants to receive newsletter</em></p>' : ''}
            <hr>
            <p style="font-size:12px;color:#666;">Reply directly to this email to respond to ${name}.</p>
          </body>
        </html>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [email],
      subject: isDataRequest 
        ? 'We received your data request | Otrzymaliśmy Twoje żądanie danych'
        : 'We received your message | Otrzymaliśmy Twoją wiadomość',
      html: `
        <!DOCTYPE html>
        <html>
          <head><style>body{font-family:Arial;line-height:1.6;}</style></head>
          <body style="padding:20px;background:#f4f4f4;">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;">
              <div style="text-align:center;margin-bottom:20px;">
                <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" alt="Spirit Candles" style="width:120px;">
              </div>
              <h2 style="color:#d4af37;">Thank You! | Dziękujemy!</h2>
              <p>Hi ${name},</p>
              <p>We have received your ${isDataRequest ? 'data request' : 'message'} and will respond within 24-48 hours.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
              <p>Cześć ${name},</p>
              <p>Otrzymaliśmy Twoje ${isDataRequest ? 'żądanie danych' : 'wiadomość'} i odpowiemy w ciągu 24-48 godzin.</p>
              <p style="text-align:center;margin-top:30px;">
                <a href="https://spirit-candle.com" style="color:#d4af37;text-decoration:none;">Visit our website | Odwiedź naszą stronę</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    // Handle newsletter subscription if requested
    if (newsletterConsent) {
      console.log(`[Contact Form] User ${email} opted for newsletter`);
      await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          language: 'en',
          source: 'contact',
          consent: true,
          consent_text: 'Opted in via contact form'
        })
      });
    }

    console.log(`[Contact Form] ${isDataRequest ? 'Data request' : 'Contact message'} processed successfully for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Message received successfully. We will respond within 24-48 hours.'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('[Contact Form] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
