import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log(`Received event: ${event.type}`);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`Processing checkout session: ${session.id}`);

      // Create Supabase client with service role
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const userId = session.metadata?.user_id;
      
      if (!userId) {
        console.error("No user_id in session metadata");
        return new Response("No user_id", { status: 400 });
      }

      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      // Get cart items to map to products
      const { data: cartItems, error: cartError } = await supabaseClient
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          product:products(*)
        `)
        .eq("user_id", userId);

      if (cartError) {
        console.error("Error fetching cart items:", cartError);
        return new Response("Error fetching cart", { status: 500 });
      }

      // Calculate totals
      const totalPLN = cartItems.reduce(
        (sum: number, item: any) => sum + item.product.price_pln * item.quantity,
        0
      );
      const totalEUR = cartItems.reduce(
        (sum: number, item: any) => sum + item.product.price_eur * item.quantity,
        0
      );

      // Get shipping address, service_id, shipping costs, and carrier from session metadata
      let shippingAddress = session.metadata?.shipping_address 
        ? JSON.parse(session.metadata.shipping_address) 
        : null;

      // Normalize address: create unified street field (avoid duplications)
      if (shippingAddress) {
        const street = (shippingAddress.street || '').trim();
        const streetNumber = (shippingAddress.streetNumber || '').trim();
        const apartmentNumber = (shippingAddress.apartmentNumber || '').trim();

        // If street already contains number/apartment, keep as is
        const hasNum = streetNumber ? new RegExp(`\\b${streetNumber}\\b`).test(street) : false;
        const hasApt = apartmentNumber ? new RegExp(`[\\\/]${apartmentNumber}(?:\\b|$)`).test(street) : false;

        let fullStreet = street;
        if (!hasNum && streetNumber) {
          fullStreet = `${street} ${streetNumber}`.trim();
        }
        if (!hasApt && apartmentNumber) {
          fullStreet = /\d$/.test(fullStreet) ? `${fullStreet}/${apartmentNumber}` : `${fullStreet} ${apartmentNumber}`;
        }

        // Update unified street while keeping original fields for backward compatibility
        shippingAddress = {
          ...shippingAddress,
          street: fullStreet,
        };
      }
      const serviceId = session.metadata?.service_id 
        ? parseInt(session.metadata.service_id) 
        : null;
      const shippingCostPLN = session.metadata?.shipping_cost_pln 
        ? parseFloat(session.metadata.shipping_cost_pln)
        : 0;
      const shippingCostEUR = session.metadata?.shipping_cost_eur
        ? parseFloat(session.metadata.shipping_cost_eur)
        : 0;
      const carrierName = session.metadata?.carrier_name || null;

      // Calculate total including shipping (keep 2 decimals)
      const orderTotalPLN = Number((totalPLN + shippingCostPLN).toFixed(2));
      const orderTotalEUR = Number((totalEUR + shippingCostEUR).toFixed(2));

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: userId,
          total_pln: orderTotalPLN,
          total_eur: orderTotalEUR,
          shipping_cost_pln: shippingCostPLN,
          shipping_cost_eur: shippingCostEUR,
          carrier_name: carrierName,
          status: "paid",
          shipping_status: "pending",
          shipping_address: shippingAddress,
          service_id: serviceId,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return new Response("Error creating order", { status: 500 });
      }

      console.log(`Created order: ${order.id}`);

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_pln: item.product.price_pln,
        price_eur: item.product.price_eur,
      }));

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        return new Response("Error creating order items", { status: 500 });
      }

      console.log(`Created ${orderItems.length} order items`);

      // Decrease stock quantities for purchased products
      for (const item of cartItems as any[]) {
        const current = Number(item.product?.stock_quantity ?? 0);
        const newQty = Math.max(0, current - Number(item.quantity));
        const { error: stockError } = await supabaseClient
          .from('products')
          .update({ stock_quantity: newQty })
          .eq('id', item.product_id);
        if (stockError) {
          console.error('Error updating stock for product', item.product_id, stockError);
        }
      }

      // Get user profile for preferred language
      const { data: userProfile } = await supabaseClient
        .from("profiles")
        .select("email, preferred_language")
        .eq("user_id", userId)
        .single();

      // Prepare order items with product names for email
      const orderItemsWithNames = cartItems.map((item: any) => ({
        product_name_en: item.product.name_en,
        product_name_pl: item.product.name_pl,
        quantity: item.quantity,
        price_pln: item.product.price_pln,
        price_eur: item.product.price_eur,
      }));

      // Send order confirmation email (background task)
      try {
        await supabaseClient.functions.invoke('send-order-confirmation', {
          body: {
            orderId: order.id,
            orderNumber: order.order_number,
            userEmail: userProfile?.email || session.customer_details?.email,
            preferredLanguage: userProfile?.preferred_language || 'en',
            orderItems: orderItemsWithNames,
            subtotalPLN: totalPLN,
            subtotalEUR: totalEUR,
            shippingCostPLN: shippingCostPLN,
            shippingCostEUR: shippingCostEUR,
            totalPLN: orderTotalPLN,
            totalEUR: orderTotalEUR,
            carrierName: carrierName,
            shippingAddress: shippingAddress,
          }
        });
        console.log("Order confirmation email sent");
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }

      // Send admin notification email (background task)
      try {
        await supabaseClient.functions.invoke('send-admin-order-notification', {
          body: {
            orderId: order.id,
            orderNumber: order.order_number,
            userEmail: userProfile?.email || session.customer_details?.email,
            totalPLN: orderTotalPLN,
            totalEUR: orderTotalEUR,
          }
        });
        console.log("Admin notification email sent");
      } catch (adminEmailError) {
        console.error("Error sending admin notification:", adminEmailError);
        // Don't fail the webhook if email fails
      }

      // Clear cart
      const { error: clearError } = await supabaseClient
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (clearError) {
        console.error("Error clearing cart:", clearError);
      } else {
        console.log("Cart cleared successfully");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
