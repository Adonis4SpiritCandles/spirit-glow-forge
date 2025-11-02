import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return new Response('Missing email parameter', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (error) throw error;

    console.log(`[Newsletter Unsubscribe] User unsubscribed: ${email}`);

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed | Wypisano</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #d4af37; }
            p { color: #666; line-height: 1.6; }
            a { color: #d4af37; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You have been removed from our mailing list.</p>
            <p>We're sorry to see you go, but you can always resubscribe on our website.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <h1>✓ Pomyślnie Wypisano</h1>
            <p>Zostałeś usunięty z naszej listy mailingowej.</p>
            <p>Szkoda, że nas opuszczasz, ale zawsze możesz ponownie zapisać się na naszej stronie.</p>
            <p style="margin-top:30px;">
              <a href="https://spirit-candle.com">Back to Spirit Candles | Powrót do Spirit Candles</a>
            </p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  } catch (error: any) {
    console.error('[Newsletter Unsubscribe] Error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
