import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  totalPLN: number;
  totalEUR: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      orderNumber,
      userEmail,
      totalPLN,
      totalEUR,
    }: AdminNotificationRequest = await req.json();

    console.log(`[Admin Notification] Sending new order notification for Order #${orderNumber}`);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
          <!-- Header with Logo -->
          <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center;">
            <img src="https://i.postimg.cc/Gpm7Mytb/spirit-logo.png" 
                 alt="Spirit Candles" 
                 style="max-width: 180px; height: auto;" />
          </div>
          
          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
              🎉 New Order on Spirit Candle Received!
            </h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              A new order has been placed and requires your attention.
            </p>

            <!-- Order Info -->
            <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
              <p style="margin: 5px 0; color: #333; font-size: 20px; font-weight: bold;">
                Order #SPIRIT-${String(orderNumber).padStart(5, '0')}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Order ID:</strong> 
                <span style="font-family: monospace; font-size: 12px;">${orderId}</span>
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Customer:</strong> ${userEmail}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Total (PLN):</strong> ${totalPLN.toFixed(2)} PLN
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Total (EUR):</strong> ${totalEUR.toFixed(2)} EUR
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Status:</strong> <span style="color: #228B22; font-weight: bold;">✅ Payment Confirmed</span>
              </p>
            </div>
            
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://spirit-candle.com/admin" 
                 style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                View in Admin Dashboard
              </a>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #333; line-height: 1.6; margin: 0;">
                Please log in to your admin dashboard to confirm and process this order.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>www.spirit-candle.com</strong> - Admin Notification System
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send to primary admin email
    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: ['m5moffice@proton.me'],
      cc: ['spiritcandlesite@gmail.com'], // Test copy
      subject: `🔔 New Order #${orderNumber} - Action Required`,
      html: emailHtml,
    });

    console.log(`[Admin Notification] Email sent successfully for Order #${orderNumber}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[Admin Notification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
