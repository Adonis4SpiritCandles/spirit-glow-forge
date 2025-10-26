import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusUpdateRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: string;
  updateType: 'completed' | 'tracking_updated' | 'shipped';
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      orderNumber,
      userEmail,
      preferredLanguage,
      updateType,
      trackingNumber,
      trackingUrl,
      carrier,
      estimatedDelivery,
    }: StatusUpdateRequest = await req.json();

    console.log(`[Status Update] Sending ${updateType} email to ${userEmail} for order #SPIRIT-${String(orderNumber).padStart(5, '0')}`);

    // Generate email content based on language and update type
    const isPolish = preferredLanguage === 'pl';
    
    let subject = '';
    let heading = '';
    let message = '';

    if (updateType === 'completed') {
      subject = isPolish 
        ? `Zamówienie #SPIRIT-${String(orderNumber).padStart(5, '0')} potwierdzone`
        : `Order #SPIRIT-${String(orderNumber).padStart(5, '0')} Confirmed`;
      heading = isPolish ? 'Zamówienie potwierdzone' : 'Order Confirmed';
      message = isPolish
        ? `Twoje zamówienie zostało potwierdzone i jest przygotowywane do wysyłki. Otrzymasz kolejną wiadomość, gdy zamówienie zostanie wysłane z numerem śledzenia.`
        : `Your order has been confirmed and is being prepared for shipment. You will receive another email when your order is shipped with tracking information.`;
    } else if (updateType === 'tracking_updated' || updateType === 'shipped') {
      subject = isPolish
        ? `Zamówienie #SPIRIT-${String(orderNumber).padStart(5, '0')} wysłane`
        : `Order #SPIRIT-${String(orderNumber).padStart(5, '0')} Shipped`;
      heading = isPolish ? 'Zamówienie w drodze!' : 'Order on its way!';
      message = isPolish
        ? `Twoje zamówienie zostało wysłane${carrier ? ` przez ${carrier}` : ''}. Możesz śledzić swoją przesyłkę używając poniższego numeru śledzenia.`
        : `Your order has been shipped${carrier ? ` via ${carrier}` : ''}. You can track your package using the tracking number below.`;
    }

    // Build email HTML
    let emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 0;
            }
            .header {
              background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #8B5CF6;
              margin-top: 0;
              font-size: 24px;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #8B5CF6;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .info-box h3 {
              margin-top: 0;
              color: #6366F1;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-box p {
              margin: 8px 0;
              font-size: 16px;
            }
            .tracking-number {
              background-color: #ffffff;
              border: 2px dashed #8B5CF6;
              padding: 15px;
              text-align: center;
              font-family: 'Courier New', monospace;
              font-size: 20px;
              font-weight: bold;
              color: #6366F1;
              margin: 20px 0;
              border-radius: 8px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
              color: #ffffff !important;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
            .footer a {
              color: #8B5CF6;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕯️ Spirit Candles</h1>
            </div>
            <div class="content">
              <h2>${heading}</h2>
              <p>${message}</p>
              
              <div class="info-box">
                <h3>${isPolish ? 'Numer zamówienia' : 'Order Number'}</h3>
                <p>#SPIRIT-${String(orderNumber).padStart(5, '0')}</p>
              </div>
    `;

    // Add tracking information if available
    if (trackingNumber) {
      emailHtml += `
        <div class="tracking-number">
          ${trackingNumber}
        </div>
        ${carrier ? `<p style="text-align: center; color: #6c757d;"><strong>${isPolish ? 'Przewoźnik' : 'Carrier'}:</strong> ${carrier}</p>` : ''}
      `;
      
      if (trackingUrl) {
        emailHtml += `
          <div style="text-align: center;">
            <a href="${trackingUrl}" class="button">
              ${isPolish ? '📦 Śledź przesyłkę' : '📦 Track Package'}
            </a>
          </div>
        `;
      }
    }

    if (estimatedDelivery) {
      emailHtml += `
        <div class="info-box">
          <h3>${isPolish ? 'Szacowana dostawa' : 'Estimated Delivery'}</h3>
          <p>${estimatedDelivery}</p>
        </div>
      `;
    }

    emailHtml += `
              <p>${isPolish 
                ? 'Dziękujemy za zakupy w Spirit Candles. Jeśli masz jakiekolwiek pytania, skontaktuj się z nami.' 
                : 'Thank you for shopping with Spirit Candles. If you have any questions, please contact us.'}</p>
            </div>
            <div class="footer">
              <p>
                <strong>Spirit Candles</strong><br>
                ${isPolish ? 'Ręcznie robione świece premium' : 'Handcrafted Premium Candles'}<br>
                <a href="mailto:info@spiritcandles.com">info@spiritcandles.com</a>
              </p>
              <p style="font-size: 12px; margin-top: 20px;">
                ${isPolish 
                  ? 'Otrzymujesz tę wiadomość, ponieważ złożyłeś zamówienie w Spirit Candles.' 
                  : 'You are receiving this email because you placed an order with Spirit Candles.'}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Spirit Candles <orders@spiritcandles.com>',
      to: [userEmail],
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      console.error('[Status Update] Error sending email:', error);
      throw error;
    }

    console.log('[Status Update] Email sent successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status update email sent',
        emailId: data?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[Status Update] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
