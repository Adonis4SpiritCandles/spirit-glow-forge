import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name_en: string;
  product_name_pl: string;
  quantity: number;
  price_pln: number;
  price_eur: number;
}

interface OrderConfirmationRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: string;
  orderItems: OrderItem[];
  subtotalPLN: number;
  subtotalEUR: number;
  shippingCostPLN: number;
  shippingCostEUR: number;
  totalPLN: number;
  totalEUR: number;
  carrierName?: string;
  shippingAddress?: {
    name?: string;
    street?: string;
    streetNumber?: string;
    apartmentNumber?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
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
      orderItems,
      subtotalPLN,
      subtotalEUR,
      shippingCostPLN,
      shippingCostEUR,
      totalPLN,
      totalEUR,
      carrierName,
      shippingAddress,
    }: OrderConfirmationRequest = await req.json();

    console.log(`Sending order confirmation email to ${userEmail} in ${preferredLanguage}`);

    const isPolish = preferredLanguage === 'pl';
    const orderRef = `SPIRIT-${String(orderNumber).padStart(5, '0')}`;

    // Build shipping address HTML
    let addressHTML = '';
    if (shippingAddress) {
      const addr = shippingAddress;
      addressHTML = `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${isPolish ? 'Adres dostawy:' : 'Shipping Address:'}</h3>
          ${addr.name ? `<p style="margin: 5px 0;"><strong>${addr.name}</strong></p>` : ''}
          ${addr.street ? `<p style="margin: 5px 0;">${addr.street}${addr.streetNumber ? ' ' + addr.streetNumber : ''}${addr.apartmentNumber ? ' / ' + addr.apartmentNumber : ''}</p>` : ''}
          ${addr.line1 ? `<p style="margin: 5px 0;">${addr.line1}</p>` : ''}
          ${addr.line2 ? `<p style="margin: 5px 0;">${addr.line2}</p>` : ''}
          ${addr.city || addr.postalCode ? `<p style="margin: 5px 0;">${addr.city || ''}${addr.city && addr.postalCode ? ', ' : ''}${addr.postalCode || ''}</p>` : ''}
          ${addr.country ? `<p style="margin: 5px 0;">${addr.country}</p>` : ''}
          ${addr.email ? `<p style="margin: 5px 0;">${isPolish ? 'Email:' : 'Email:'} ${addr.email}</p>` : ''}
          ${addr.phone ? `<p style="margin: 5px 0;">${isPolish ? 'Telefon:' : 'Phone:'} ${addr.phone}</p>` : ''}
        </div>
      `;
    }

    const itemsHTML = orderItems
      .map((item) => {
        const productName = isPolish ? item.product_name_pl : item.product_name_en;
        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${Number(item.price_pln).toFixed(2)} PLN</td>
        </tr>
      `;
      })
      .join("");

    const subject = isPolish 
      ? `Potwierdzenie zamówienia ${orderRef}` 
      : `Order Confirmation ${orderRef}`;

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
              <img src="https://i.postimg.cc/Gpm7Mytb/spirit-logo.png" 
                   alt="Spirit Candles" 
                   style="max-width: 180px; height: auto;" />
            </div>
            
            <!-- Main Content -->
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
                ${isPolish ? 'Dziękujemy za Twoje zamówienie!' : 'Thank You for Your Order!'}
              </h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${isPolish 
                  ? 'Twoje zamówienie zostało pomyślnie złożone. Poniżej znajdują się szczegóły zamówienia:'
                  : 'Your order has been successfully placed. Below are your order details:'}
              </p>

              <!-- Order Info -->
              <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'Numer zamówienia:' : 'Order Number:'}</strong> ${orderRef}
                </p>
                <p style="margin: 5px 0; color: #333;">
                  <strong>${isPolish ? 'ID zamówienia:' : 'Order ID:'}</strong> 
                  <span style="font-family: monospace; font-size: 12px;">${orderId}</span>
                </p>
                ${carrierName ? `
                  <p style="margin: 5px 0; color: #333;">
                    <strong>${isPolish ? 'Kurier:' : 'Carrier:'}</strong> ${carrierName}
                  </p>
                ` : ''}
              </div>

              ${addressHTML}

              <!-- Order Items -->
              <h2 style="color: #333; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">
                ${isPolish ? 'Pozycje zamówienia:' : 'Order Items:'}
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d4af37;">
                      ${isPolish ? 'Produkt' : 'Product'}
                    </th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d4af37;">
                      ${isPolish ? 'Ilość' : 'Quantity'}
                    </th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d4af37;">
                      ${isPolish ? 'Cena' : 'Price'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">
                      ${isPolish ? 'Suma częściowa:' : 'Subtotal:'}
                    </td>
                    <td style="padding: 12px; text-align: right;">
                      ${Number(subtotalPLN).toFixed(2)} PLN / ${Number(subtotalEUR).toFixed(2)} EUR
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">
                      ${isPolish ? 'Koszt dostawy:' : 'Shipping Cost:'}
                    </td>
                    <td style="padding: 12px; text-align: right;">
                      ${Number(shippingCostPLN).toFixed(2)} PLN / ${Number(shippingCostEUR).toFixed(2)} EUR
                    </td>
                  </tr>
                  <tr style="background: #f9f9f9;">
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #d4af37;">
                      ${isPolish ? 'Razem:' : 'Total:'}
                    </td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #d4af37; border-top: 2px solid #d4af37;">
                      ${Number(totalPLN).toFixed(2)} PLN / ${Number(totalEUR).toFixed(2)} EUR
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #333; line-height: 1.6; margin: 0;">
                  ${isPolish 
                    ? 'Przetwarzamy Twoje zamówienie i wkrótce otrzymasz powiadomienie o wysyłce z numerem śledzenia przesyłki.'
                    : 'We are processing your order and you will receive a shipping notification with tracking number shortly.'}
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

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
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
