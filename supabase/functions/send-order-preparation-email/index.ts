import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreparationEmailRequest {
  orderId: string;
  orderNumber: number;
  userEmail: string;
  preferredLanguage: string;
  userName?: string;
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
      preferredLanguage = 'en',
      userName,
    }: PreparationEmailRequest = await req.json();

    const isPolish = preferredLanguage === 'pl';

    console.log(`[Order Preparation Email] Sending to ${userEmail} in ${preferredLanguage}`);

    // Get order details from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new Error('Order not found');
    }

    const orderItems = order.order_items || [];
    const productRows = orderItems.map((item: any) => {
      const product = item.products;
      const productName = isPolish ? product.name_pl : product.name_en;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
            ${isPolish ? `${item.price_pln.toFixed(2)} PLN` : `€${item.price_eur.toFixed(2)}`}
          </td>
        </tr>
      `;
    }).join('');

    const totalLabel = isPolish ? 'Suma' : 'Total';
    const shippingLabel = isPolish ? 'Wysyłka' : 'Shipping';
    const productsLabel = isPolish ? 'Produkty' : 'Products';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center;">
            <img src="https://i.postimg.cc/Gpm7Mytb/spirit-logo.png" 
                 alt="Spirit Candles" 
                 style="max-width: 180px; height: auto;" />
          </div>
          
          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
              ✅ ${isPolish ? 'Zamówienie potwierdzone!' : 'Order Confirmed!'}
            </h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${isPolish 
                ? `Cześć ${userName || ''},<br><br>Twoje zamówienie zostało potwierdzone i jest przygotowywane do wysyłki.` 
                : `Hello ${userName || ''},<br><br>Your order has been confirmed and is being prepared for shipment.`}
            </p>

            <!-- Order Info -->
            <div style="background: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
              <p style="margin: 5px 0; color: #333; font-size: 20px; font-weight: bold;">
                ${isPolish ? 'Zamówienie' : 'Order'} #SPIRIT-${String(orderNumber).padStart(5, '0')}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>${isPolish ? 'Status' : 'Status'}:</strong> 
                <span style="color: #228B22;">✅ ${isPolish ? 'Przygotowywane do wysyłki' : 'Being prepared for shipment'}</span>
              </p>
            </div>

            <!-- Products Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d4af37;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d4af37;">${isPolish ? 'Produkt' : 'Product'}</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d4af37;">${isPolish ? 'Ilość' : 'Quantity'}</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d4af37;">${isPolish ? 'Cena' : 'Price'}</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
              <tfoot>
                <tr style="background-color: #f9f9f9;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #d4af37;">
                    ${productsLabel}:
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #d4af37;">
                    ${isPolish ? `${(order.total_pln - (order.shipping_cost_pln || 0)).toFixed(2)} PLN` : `€${(order.total_eur - (order.shipping_cost_eur || 0)).toFixed(2)}`}
                  </td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">
                    ${shippingLabel}:
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold;">
                    ${isPolish ? `${(order.shipping_cost_pln || 0).toFixed(2)} PLN` : `€${(order.shipping_cost_eur || 0).toFixed(2)}`}
                  </td>
                </tr>
                <tr style="background-color: #f0f0f0;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #d4af37;">
                    ${totalLabel}:
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #d4af37;">
                    ${isPolish ? `${order.total_pln.toFixed(2)} PLN` : `€${order.total_eur.toFixed(2)}`}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #333; line-height: 1.6; margin: 0;">
                ${isPolish 
                  ? 'Otrzymasz kolejnego e-maila z numerem śledzenia, gdy zamówienie zostanie wysłane.' 
                  : 'You will receive another email with tracking number when your order is shipped.'}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>www.spirit-candle.com</strong>
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              ${isPolish ? 'Dziękujemy za zakupy!' : 'Thank you for your purchase!'}
            </p>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [userEmail],
      subject: isPolish 
        ? `✅ Zamówienie #${orderNumber} jest przygotowywane do wysyłki` 
        : `✅ Order #${orderNumber} is Being Prepared for Shipment`,
      html: emailHtml,
    });

    console.log(`[Order Preparation Email] Sent successfully to ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[Order Preparation Email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});