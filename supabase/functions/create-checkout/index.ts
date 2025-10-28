import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Get request body
    const { cartItems, shippingAddress, serviceId, shippingCost = 0, carrierName, couponCode } = await req.json();
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("No cart items provided");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Map cart items to line items
    // For simplicity, using fixed price IDs - in production you'd map product IDs to price IDs
    const priceMap: Record<string, string> = {
      "281d5900-7df0-4bfe-9d4d-920267df2125": "price_1S971nDllMinRcxPqTG8h1r0", // Mystic Rose
      "c576eedf-5a2e-4991-bac9-13d1e8160e85": "price_1S974EDllMinRcxPFufkrqc6", // Golden Amber
    };

    const lineItems = cartItems.map((item: any) => {
      const priceId = priceMap[item.product.id];
      if (!priceId) {
        // Fallback to dynamic price creation for unmapped products
        return {
          price_data: {
            currency: 'pln',
            product_data: {
              name: item.product.name_en,
              description: item.product.description_en,
            },
            unit_amount: item.product.price_pln * 100, // Stripe expects amounts in grosze (cents)
          },
          quantity: item.quantity,
        };
      }
      return {
        price: priceId,
        quantity: item.quantity,
      };
    });

    // Add shipping cost as a line item if present
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'pln',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to grosze
        },
        quantity: 1,
      });
    }

    // Calculate shipping costs in both currencies (assuming shippingCost is in PLN)
    const shippingCostPLN = Number(Number(shippingCost).toFixed(2));
    const shippingCostEUR = Number((Number(shippingCost) / 4.3).toFixed(2)); // Approximate conversion, keep 2 decimals

    // Validate and apply coupon if provided
    let couponData = null;
    let discountAmount = 0;
    
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (coupon && !couponError) {
        const now = new Date();
        const isValid = 
          (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
          (!coupon.valid_to || new Date(coupon.valid_to) >= now) &&
          (!coupon.max_redemptions || coupon.redemptions_count < coupon.max_redemptions);

        if (isValid) {
          couponData = coupon;
          
          // Calculate subtotal of PRODUCTS ONLY (excluding shipping) in grosze
          const productsSubtotalGrosze = cartItems.reduce((sum: number, item: any) => 
            sum + Math.round(item.product.price_pln * 100 * item.quantity), 0);
          
          // Calculate discount ONLY on products (never on shipping)
          if (coupon.percent_off) {
            discountAmount = Math.round(productsSubtotalGrosze * coupon.percent_off / 100);
          } else if (coupon.amount_off_pln) {
            discountAmount = Math.round(coupon.amount_off_pln * 100);
            // Cap discount to products subtotal - 1 grosz minimum
            if (discountAmount >= productsSubtotalGrosze) {
              discountAmount = productsSubtotalGrosze - 1;
            }
          }

          console.log(`Coupon applied: ${coupon.code}, discount: ${discountAmount / 100} PLN`);

          // Increment redemption count
          await supabaseClient
            .from('coupons')
            .update({ redemptions_count: coupon.redemptions_count + 1 })
            .eq('id', coupon.id);
        }
      }
    }

    // Create checkout session with optional discount
    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        user_id: user.id,
        shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : '',
        service_id: serviceId?.toString() || '',
        shipping_cost_pln: shippingCostPLN.toString(),
        shipping_cost_eur: shippingCostEUR.toString(),
        carrier_name: carrierName || '',
        coupon_code: couponData?.code || '',
        discount_amount: discountAmount > 0 ? (discountAmount / 100).toFixed(2) : '0',
      },
    };

    // Apply discount proportionally to product line items if coupon was applied
    // Shipping cost remains untouched for Furgonetka integration
    if (discountAmount > 0 && couponData) {
      // Calculate products subtotal in grosze
      const productsSubtotalGrosze = cartItems.reduce((sum: number, item: any) => 
        sum + Math.round(item.product.price_pln * 100 * item.quantity), 0);
      
      // Calculate discount factor for products only
      const discountFactor = (productsSubtotalGrosze - discountAmount) / productsSubtotalGrosze;
      
      console.log(`Applying discount factor: ${discountFactor}, products subtotal: ${productsSubtotalGrosze / 100} PLN`);
      
      // Apply discount to product line items proportionally
      sessionParams.line_items = sessionParams.line_items.map((item: any, index: number) => {
        // Only apply discount to product items (not shipping)
        if (index < cartItems.length) {
          const originalAmount = item.price_data ? item.price_data.unit_amount : Math.round(cartItems[index].product.price_pln * 100);
          const discountedAmount = Math.max(1, Math.round(originalAmount * discountFactor));
          
          return {
            price_data: {
              currency: 'pln',
              product_data: {
                name: item.price_data?.product_data?.name || cartItems[index].product.name_en,
                description: item.price_data?.product_data?.description || cartItems[index].product.description_en,
              },
              unit_amount: discountedAmount,
            },
            quantity: item.quantity,
          };
        }
        // Keep shipping line item unchanged
        return item;
      });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Created checkout session: ${session.id} for user: ${user.email}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});