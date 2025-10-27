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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center; }
          .logo { max-width: 180px; height: auto; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-box { background: white; border: 2px solid #D4AF37; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .order-number { font-size: 24px; font-weight: bold; color: #D4AF37; margin-bottom: 10px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .total { font-size: 20px; font-weight: bold; color: #D4AF37; margin-top: 15px; padding-top: 15px; border-top: 2px solid #D4AF37; }
          .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://fhtuqmdlgzmpsbflxhra.supabase.co/storage/v1/object/public/products/spirit-logo.png" alt="Spirit Candles" class="logo">
          </div>
          
          <div class="content">
            <h2 style="color: #1a1a1a;">🎉 New Order Received!</h2>
            <p>A new order has been placed and requires your attention.</p>
            
            <div class="order-box">
              <div class="order-number">Order #${orderNumber}</div>
              
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">${orderId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Customer Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Total (PLN):</span>
                <span class="value">${totalPLN.toFixed(2)} PLN</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Total (EUR):</span>
                <span class="value">${totalEUR.toFixed(2)} EUR</span>
              </div>
              
              <div class="total">
                Status: ✅ Payment Confirmed
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://spirit-candle.com" class="cta-button">View in Admin Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Please log in to your admin dashboard to confirm and process this order.
            </p>
          </div>
          
          <div class="footer">
            <p>Spirit Candles - Admin Notification System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
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
