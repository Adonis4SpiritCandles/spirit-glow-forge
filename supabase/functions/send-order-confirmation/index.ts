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
  shippingAddress: any;
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

    // Build products list
    const productsListHTML = orderItems.map(item => {
      const productName = isPolish ? item.product_name_pl : item.product_name_en;
      return `<li>${productName} x ${item.quantity} - ${item.price_pln} PLN</li>`;
    }).join('');

    // Build shipping address
    const addressHTML = shippingAddress ? `
      <p>
        ${shippingAddress.name || ''}<br/>
        ${shippingAddress.line1 || ''}<br/>
        ${shippingAddress.line2 ? shippingAddress.line2 + '<br/>' : ''}
        ${shippingAddress.city || ''}, ${shippingAddress.postal_code || ''}<br/>
        ${shippingAddress.country || ''}
      </p>
    ` : 'N/A';

    const subject = isPolish
      ? `Potwierdzenie zamówienia ${orderRef}`
      : `Order Confirmation ${orderRef}`;

    const html = isPolish ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Dziękujemy za zamówienie!</h1>
        <p>Twoje zamówienie zostało pomyślnie złożone.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Numer zamówienia:</strong> ${orderRef}</p>
          <p><strong>ID zamówienia:</strong> ${orderId}</p>
          <p><strong>Data zamówienia:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        <h2 style="color: #333;">Produkty:</h2>
        <ul style="list-style: none; padding: 0;">
          ${productsListHTML}
        </ul>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Subtotal produktów:</strong> ${subtotalPLN} PLN / ${subtotalEUR} EUR</p>
          <p><strong>Koszt wysyłki:</strong> ${shippingCostPLN} PLN / ${shippingCostEUR} EUR</p>
          ${carrierName ? `<p><strong>Kurier:</strong> ${carrierName}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;" />
          <p style="font-size: 18px;"><strong>Razem:</strong> ${totalPLN} PLN / ${totalEUR} EUR</p>
        </div>

        <h2 style="color: #333;">Adres dostawy:</h2>
        ${addressHTML}

        <p style="margin-top: 30px;">Prześlemy Ci informacje o śledzeniu przesyłki po wysłaniu zamówienia.</p>

        <p style="margin-top: 30px; color: #666;">
          Dziękujemy za wybranie Spirit Candles!<br/>
          <a href="mailto:m5moffice@proton.me" style="color: #333;">m5moffice@proton.me</a>
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank you for your order!</h1>
        <p>Your order has been successfully placed.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderRef}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-US')}</p>
        </div>

        <h2 style="color: #333;">Products:</h2>
        <ul style="list-style: none; padding: 0;">
          ${productsListHTML}
        </ul>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Products Subtotal:</strong> ${subtotalPLN} PLN / ${subtotalEUR} EUR</p>
          <p><strong>Shipping Cost:</strong> ${shippingCostPLN} PLN / ${shippingCostEUR} EUR</p>
          ${carrierName ? `<p><strong>Carrier:</strong> ${carrierName}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;" />
          <p style="font-size: 18px;"><strong>Total:</strong> ${totalPLN} PLN / ${totalEUR} EUR</p>
        </div>

        <h2 style="color: #333;">Shipping Address:</h2>
        ${addressHTML}

        <p style="margin-top: 30px;">We'll send you tracking information once your order ships.</p>

        <p style="margin-top: 30px; color: #666;">
          Thank you for choosing Spirit Candles!<br/>
          <a href="mailto:m5moffice@proton.me" style="color: #333;">m5moffice@proton.me</a>
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Spirit Candles <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: html,
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
