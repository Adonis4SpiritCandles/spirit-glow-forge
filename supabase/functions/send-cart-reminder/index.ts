import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Starting cart reminder cron job...");

    // Get all users with items in cart
    const { data: carts, error: cartsError } = await supabase
      .from('cart_items')
      .select('user_id, created_at, products(name_en, name_pl, image_url, price_pln, price_eur)')
      .not('user_id', 'is', null);

    if (cartsError) throw cartsError;

    // Group cart items by user
    const userCarts = new Map<string, any[]>();
    for (const item of carts || []) {
      if (!userCarts.has(item.user_id)) {
        userCarts.set(item.user_id, []);
      }
      userCarts.get(item.user_id)!.push(item);
    }

    console.log(`Found ${userCarts.size} users with items in cart`);

    let emailsSent = 0;

    // Process each user's cart
    for (const [userId, items] of userCarts.entries()) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, preferred_language')
        .eq('user_id', userId)
        .single();

      if (!profile?.email) continue;

      // Check if cart has items older than 24 hours
      const oldestItem = items.reduce((oldest, item) => {
        const itemDate = new Date(item.created_at);
        return itemDate < oldest ? itemDate : oldest;
      }, new Date());

      const hoursSinceCreated = (Date.now() - oldestItem.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreated < 24) continue; // Skip if cart is less than 24h old

      // Check reminder history
      const { data: reminderHistory } = await supabase
        .from('cart_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(1);

      const lastReminder = reminderHistory?.[0];
      const now = Date.now();
      
      // Determine if we should send reminder based on schedule
      let shouldSend = false;
      let reminderType = 'first';

      if (!lastReminder) {
        shouldSend = hoursSinceCreated >= 24;
        reminderType = 'first';
      } else {
        const hoursSinceLastReminder = (now - new Date(lastReminder.sent_at).getTime()) / (1000 * 60 * 60);
        const daysSinceFirstReminder = (now - new Date(lastReminder.first_reminder_at || lastReminder.sent_at).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceFirstReminder <= 3 && hoursSinceLastReminder >= 24) {
          shouldSend = true;
          reminderType = 'daily';
        } else if (daysSinceFirstReminder > 3 && hoursSinceLastReminder >= 168) {
          // Weekly reminder after day 3
          shouldSend = true;
          reminderType = 'weekly';
        }
      }

      if (!shouldSend) continue;

      // Send reminder email
      const isPolish = profile.preferred_language === 'pl';
      
      const itemsHTML = items.slice(0, 3).map(item => {
        const product = item.products;
        const name = isPolish ? product.name_pl : product.name_en;
        return `
          <div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <img src="${product.image_url}" alt="${name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
            <div>
              <h4 style="margin: 0 0 5px 0; color: #333;">${name}</h4>
              <p style="margin: 0; color: #d4af37; font-weight: 600;">${product.price_pln} PLN</p>
            </div>
          </div>
        `;
      }).join('');

      const subject = isPolish 
        ? '🕯️ Zostaw coś w koszyku? Twoje świece na Ciebie czekają!' 
        : '🕯️ Left something in your cart? Your candles are waiting!';

      await resend.emails.send({
        from: "Spirit Candles <team@spirit-candle.com>",
        to: [profile.email],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center;">
                <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" 
                     alt="Spirit Candles" 
                     style="max-width: 180px; height: auto;" />
              </div>
              
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
                  ${isPolish ? '🕯️ Nie zapomnij o swoich świecach!' : '🕯️ Don\'t Forget Your Candles!'}
                </h1>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  ${isPolish 
                    ? 'Zauważyliśmy, że zostawiłeś kilka pięknych świec w koszyku. Nie chcemy, żebyś o nich zapomniał!'
                    : 'We noticed you left some beautiful candles in your cart. We don\'t want you to miss out!'}
                </p>

                <h3 style="color: #333; margin-bottom: 15px;">${isPolish ? 'Produkty w koszyku:' : 'Items in Your Cart:'}</h3>
                ${itemsHTML}
                
                ${items.length > 3 ? `
                  <p style="color: #666; font-style: italic;">
                    ${isPolish ? `...i ${items.length - 3} więcej` : `...and ${items.length - 3} more`}
                  </p>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://spirit-candle.com/cart" 
                     style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa8c2a 100%); 
                            color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; 
                            font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                    ${isPolish ? '🛒 Dokończ Zamówienie' : '🛒 Complete Your Order'}
                  </a>
                </div>

                <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
                  <p style="color: #333; line-height: 1.6; margin: 0; text-align: center;">
                    ${isPolish 
                      ? '✨ Twój spokój i harmonia są na wyciągnięcie ręki. Dokończ zamówienie już dziś!'
                      : '✨ Your peace and harmony are just a click away. Complete your order today!'}
                  </p>
                </div>
              </div>

              <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  <strong>Spirit Candles</strong> - ${isPolish ? 'Odrodzenie Twojej Natury' : 'Reborn Your Nature'}
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  ${isPolish 
                    ? 'Nie chcesz otrzymywać przypomnień? Dokończ zamówienie lub opróżnij koszyk.'
                    : 'Don\'t want reminders? Complete your order or empty your cart.'}
                </p>
              </div>
            </body>
          </html>
        `,
      });

      // Log reminder sent
      await supabase.from('cart_reminders').insert({
        user_id: userId,
        reminder_type: reminderType,
        sent_at: new Date().toISOString(),
        first_reminder_at: lastReminder?.first_reminder_at || new Date().toISOString(),
      });

      emailsSent++;
      console.log(`Sent cart reminder to ${profile.email} (${reminderType})`);
    }

    console.log(`Cart reminder job completed. Sent ${emailsSent} emails.`);

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in cart reminder cron job:", error);
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
