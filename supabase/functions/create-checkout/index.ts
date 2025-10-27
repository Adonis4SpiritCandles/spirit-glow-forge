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
    const { cartItems, shippingAddress, serviceId, shippingCost = 0, carrierName } = await req.json();
    
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        user_id: user.id,
        shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : undefined,
        service_id: serviceId?.toString(),
        shipping_cost_pln: shippingCostPLN.toString(),
        shipping_cost_eur: shippingCostEUR.toString(),
        carrier_name: carrierName || undefined,
      },
    });

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