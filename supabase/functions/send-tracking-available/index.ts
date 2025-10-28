import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackingAvailableRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: string;
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      orderNumber,
      userEmail,
      preferredLanguage,
      carrierName,
      trackingNumber,
      trackingUrl,
    }: TrackingAvailableRequest = await req.json();

    console.log(`Sending tracking available email to ${userEmail} in ${preferredLanguage}`);

    const isPolish = preferredLanguage === 'pl';
    const orderRef = `SPIRIT-${String(orderNumber).padStart(5, '0')}`;

    const subject = isPolish 
      ? `Twoja przesyłka ${orderRef} została wysłana` 
      : `Your Order ${orderRef} Has Been Shipped`;

    const emailResponse = await resend.emails.send({
      from: "Spirit Candles <team@spirit-candle.com>",
      to: [userEmail],
      subject: subject,
      html: `
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
                ${isPolish ? 'Twoje zamówienie zostało wysłane!' : 'Your Order Has Been Shipped!'}
              </h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${isPolish 
                  ? 'Twoja przesyłka jest w drodze! Możesz śledzić jej status korzystając z poniższych informacji.'
                  : 'Your package is on its way! You can track its status using the information below.'}
              </p>

              <!-- Order Info -->
              <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer zamówienia:' : 'Order Number:'}</strong> ${orderRef}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Kurier:' : 'Carrier:'}</strong> ${carrierName}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer przesyłki:' : 'Tracking Number:'}</strong> 
                  <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${trackingNumber}</span>
                </p>
              </div>

              <!-- Tracking Button -->
              ${trackingUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${trackingUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa8c2a 100%); 
                            color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; 
                            font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                    ${isPolish ? '🔍 Śledź Przesyłkę' : '🔍 Track Your Package'}
                  </a>
                </div>
              ` : ''}

              <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #333; line-height: 1.6; margin: 0;">
                  ${isPolish 
                    ? 'Czas dostawy może się różnić w zależności od kuriera i lokalizacji. Otrzymasz powiadomienie, gdy przesyłka zostanie dostarczona.'
                    : 'Delivery time may vary depending on the carrier and location. You will receive a notification when your package is delivered.'}
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
      `,
    });

    console.log("Tracking available email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending tracking available email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
