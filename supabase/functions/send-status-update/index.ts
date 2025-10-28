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
  updateType: 'completed' | 'tracking_updated' | 'shipped' | 'tracking_available' | 'delivered';
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
    } else if (updateType === 'tracking_available') {
      subject = isPolish
        ? `Numer śledzenia dostępny - Zamówienie #SPIRIT-${String(orderNumber).padStart(5, '0')}`
        : `Tracking Number Available - Order #SPIRIT-${String(orderNumber).padStart(5, '0')}`;
      heading = isPolish ? 'Numer śledzenia dostępny!' : 'Tracking Number Available!';
      message = isPolish
        ? `Twoje zamówienie${carrier ? ` (${carrier})` : ''} ma teraz dostępny numer śledzenia. Możesz śledzić swoją przesyłkę używając poniższego numeru.`
        : `Your order${carrier ? ` (${carrier})` : ''} now has a tracking number available. You can track your package using the number below.`;
    } else if (updateType === 'tracking_updated' || updateType === 'shipped') {
      subject = isPolish
        ? `Zamówienie #SPIRIT-${String(orderNumber).padStart(5, '0')} wysłane`
        : `Order #SPIRIT-${String(orderNumber).padStart(5, '0')} Shipped`;
      heading = isPolish ? 'Zamówienie w drodze!' : 'Order on its way!';
      message = isPolish
        ? `Twoje zamówienie zostało wysłane${carrier ? ` przez ${carrier}` : ''}. Możesz śledzić swoją przesyłkę używając poniższego numeru śledzenia.`
        : `Your order has been shipped${carrier ? ` via ${carrier}` : ''}. You can track your package using the tracking number below.`;
    } else if (updateType === 'delivered') {
      subject = isPolish
        ? `Zamówienie #SPIRIT-${String(orderNumber).padStart(5, '0')} dostarczone`
        : `Order #SPIRIT-${String(orderNumber).padStart(5, '0')} Delivered`;
      heading = isPolish ? '🎉 Dostarczono!' : '🎉 Delivered!';
      message = isPolish
        ? `Twoje zamówienie zostało oznaczone jako dostarczone${carrier ? ` przez ${carrier}` : ''}. Dziękujemy za zakupy w Spirit Candles!`
        : `Your order has been marked as delivered${carrier ? ` by ${carrier}` : ''}. Thank you for shopping with Spirit Candles!`;
    }

    // Build email HTML
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
            <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" 
                 alt="Spirit Candles" 
                 style="max-width: 180px; height: auto;" />
          </div>
          
          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
              ${heading}
            </h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${message}
            </p>

            <!-- Order Info -->
            <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
              <p style="margin: 5px 0; color: #333; font-size: 18px; font-weight: bold;">
                ${isPolish ? 'Numer zamówienia:' : 'Order Number:'} SPIRIT-${String(orderNumber).padStart(5, '0')}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>${isPolish ? 'ID zamówienia:' : 'Order ID:'}</strong> 
                <span style="font-family: monospace; font-size: 12px;">${orderId}</span>
              </p>
              ${trackingNumber ? `
              <p style="margin: 5px 0; color: #333;">
                <strong>${isPolish ? 'Numer śledzenia:' : 'Tracking Number:'}</strong> ${trackingNumber}
              </p>
              ${trackingUrl ? `
              <p style="margin: 5px 0;">
                <a href="${trackingUrl}" style="color: #d4af37; text-decoration: none; font-weight: 600;">
                  ${isPolish ? '📦 Śledź przesyłkę' : '📦 Track Package'} →
                </a>
              </p>
              ` : ''}
              ` : ''}
              ${carrier ? `
              <p style="margin: 5px 0; color: #333;">
                <strong>${isPolish ? 'Przewoźnik:' : 'Carrier:'}</strong> ${carrier}
              </p>
              ` : ''}
              ${estimatedDelivery ? `
              <p style="margin: 5px 0; color: #333;">
                <strong>${isPolish ? 'Szacowana dostawa:' : 'Estimated Delivery:'}</strong> ${estimatedDelivery}
              </p>
              ` : ''}
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #333; line-height: 1.6; margin: 0;">
                ${isPolish 
                  ? 'Dziękujemy za zakupy w Spirit Candles. Jeśli masz jakiekolwiek pytania, skontaktuj się z nami.' 
                  : 'Thank you for shopping with Spirit Candles. If you have any questions, please contact us.'}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              ${isPolish ? 'Dziękujemy za zakupy w' : 'Thank you for shopping with'} <strong>Spirit Candles</strong>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              ${isPolish 
                ? 'Jeśli masz pytania, skontaktuj się z nami pod adresem m5moffice@proton.me'
                : 'If you have any questions, contact us at m5moffice@proton.me'}
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
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
