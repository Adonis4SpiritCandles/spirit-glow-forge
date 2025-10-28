import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryConfirmationRequest {
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
    }: DeliveryConfirmationRequest = await req.json();

    console.log(`Sending delivery confirmation email to ${userEmail} in ${preferredLanguage}`);

    const isPolish = preferredLanguage === 'pl';
    const orderRef = `SPIRIT-${String(orderNumber).padStart(5, '0')}`;

    const subject = isPolish 
      ? `Twoje zamówienie ${orderRef} zostało dostarczone` 
      : `Your Order ${orderRef} Has Been Delivered`;

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
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 64px;">✅</span>
              </div>
              
              <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600; text-align: center;">
                ${isPolish ? 'Dostawa Zakończona!' : 'Delivery Complete!'}
              </h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                ${isPolish 
                  ? 'Twoje zamówienie zostało pomyślnie dostarczone. Ciesz się swoimi świecami Spirit Candles!'
                  : 'Your order has been successfully delivered. Enjoy your Spirit Candles!'}
              </p>

              <!-- Order Info -->
              <div style="background: #f9f9f9; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer zamówienia:' : 'Order Number:'}</strong> ${orderRef}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Status:' : 'Status:'}</strong> 
                  <span style="color: #28a745;">${isPolish ? 'Dostarczone' : 'Delivered'}</span>
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Kurier:' : 'Carrier:'}</strong> ${carrierName}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer przesyłki:' : 'Tracking Number:'}</strong> 
                  <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${trackingNumber}</span>
                </p>
              </div>

              ${trackingUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${trackingUrl}" 
                     style="display: inline-block; background: #f5f5f5; 
                            color: #333; text-decoration: none; padding: 12px 30px; border-radius: 8px; 
                            font-weight: 600; font-size: 14px; border: 1px solid #ddd;">
                    ${isPolish ? 'Zobacz Szczegóły Dostawy' : 'View Delivery Details'}
                  </a>
                </div>
              ` : ''}

              <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #f0e68c;">
                <h3 style="color: #333; margin-top: 0;">${isPolish ? 'Jak dbać o świece?' : 'Candle Care Tips'}</h3>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>${isPolish ? 'Przytnij knot do 5mm przed każdym użyciem' : 'Trim wick to 5mm before each use'}</li>
                  <li>${isPolish ? 'Pal świecę przez 2-3 godziny przy pierwszym użyciu' : 'Burn for 2-3 hours on first use'}</li>
                  <li>${isPolish ? 'Nigdy nie zostawiaj płonącej świecy bez nadzoru' : 'Never leave a burning candle unattended'}</li>
                </ul>
              </div>

              <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #333; line-height: 1.6; margin: 0; text-align: center;">
                  ${isPolish 
                    ? '💝 Dziękujemy za zaufanie! Podziel się swoją opinią i pokaż nam, jak używasz swoich świec.'
                    : '💝 Thank you for your trust! Share your review and show us how you enjoy your candles.'}
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

    console.log("Delivery confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending delivery confirmation email:", error);
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
