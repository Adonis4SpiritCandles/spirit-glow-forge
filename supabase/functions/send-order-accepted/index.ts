import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderAcceptedRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: string;
  carrierName: string;
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
    }: OrderAcceptedRequest = await req.json();

    console.log(`Sending order accepted email to ${userEmail} in ${preferredLanguage}`);

    const isPolish = preferredLanguage === 'pl';
    const orderRef = `SPIRIT-${String(orderNumber).padStart(5, '0')}`;

    const subject = isPolish 
      ? `Zamówienie ${orderRef} zostało przyjęte` 
      : `Order ${orderRef} Has Been Accepted`;

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
                ${isPolish ? 'Twoje zamówienie zostało przyjęte!' : 'Your Order Has Been Accepted!'}
              </h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${isPolish 
                  ? 'Przygotowujemy Twoje zamówienie do wysyłki. Wkrótce otrzymasz kolejną wiadomość z numerem śledzenia.'
                  : 'We are preparing your order for shipment. You will receive another email with tracking information soon.'}
              </p>

              <!-- Order Info -->
              <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer zamówienia:' : 'Order Number:'}</strong> ${orderRef}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Status:' : 'Status:'}</strong> 
                  <span style="color: #28a745;">${isPolish ? 'Przyjęte i w przygotowaniu' : 'Accepted and Preparing'}</span>
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Kurier:' : 'Carrier:'}</strong> ${carrierName}
                </p>
              </div>

              <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h3 style="color: #333; margin-top: 0;">${isPolish ? 'Co dalej?' : 'What\'s Next?'}</h3>
                <p style="color: #333; line-height: 1.6; margin: 0;">
                  ${isPolish 
                    ? 'Pakujemy Twoje świece z najwyższą starannością. Po wysłaniu otrzymasz email z numerem śledzenia przesyłki.'
                    : 'We are carefully packaging your candles. Once shipped, you will receive an email with tracking information.'}
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

    console.log("Order accepted email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order accepted email:", error);
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
