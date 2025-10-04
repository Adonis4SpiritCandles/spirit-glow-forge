import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShipmentRequest {
  orderId: string;
  carrier: string;
  service: string;
  weight: number;
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { orderId, weight, dimensions }: ShipmentRequest = await req.json();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_user_id_fkey(email, first_name, last_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    console.log('Creating Furgonetka shipment with data:', {
      orderId,
      service_id: order.service_id,
      weight,
      dimensions,
      shipping_address: order.shipping_address
    });

    // Get access token
    const tokenResponse = await fetch(`${supabaseUrl}/functions/v1/get-furgonetka-token`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Furgonetka token');
    }

    const { access_token } = await tokenResponse.json();

    // Get service_id from order
    if (!order.service_id) {
      throw new Error('No shipping service selected for this order');
    }

    // Prepare shipping address
    const shippingAddress = order.shipping_address || {};
    
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      throw new Error('Missing required shipping address fields');
    }

    // Create shipment via Furgonetka API
    const shipmentData = {
      service_id: order.service_id,
      sender: {
        name: "Spirit Candle",
        street: "Via Example 123",
        city: "Varsavia",
        zip_code: "00-001",
        country_code: "PL",
        email: "m5moffice@proton.me",
        phone: "+48123456789"
      },
      receiver: {
        name: shippingAddress.name || 'Customer',
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        post_code: shippingAddress.postalCode || shippingAddress.post_code || '',
        country: shippingAddress.country || 'PL',
        email: shippingAddress.email || order.profiles?.email || '',
        phone: shippingAddress.phone || ''
      },
      parcels: [{
        weight: weight,
        width: dimensions?.width || 30,
        height: dimensions?.height || 30,
        length: dimensions?.length || 30
      }],
      reference: orderId,
      cod: false
    };

    console.log('Creating Furgonetka shipment:', JSON.stringify(shipmentData));

    const shipmentResponse = await fetch('https://api.sandbox.furgonetka.pl/api/v1/packages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipmentData),
    });

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      console.error('Furgonetka API error:', errorText);
      throw new Error(`Failed to create shipment: ${errorText}`);
    }

    const shipmentResult = await shipmentResponse.json();
    console.log('Shipment created:', shipmentResult);

    // Update order with tracking info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        furgonetka_package_id: shipmentResult.id || shipmentResult.package_id,
        tracking_number: shipmentResult.tracking_number || shipmentResult.waybill,
        carrier: shipmentResult.carrier || 'Furgonetka',
        shipping_status: 'created',
        shipping_label_url: shipmentResult.label_url || shipmentResult.waybill_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        packageId: shipmentResult.id || shipmentResult.package_id,
        trackingNumber: shipmentResult.tracking_number || shipmentResult.waybill,
        labelUrl: shipmentResult.label_url || shipmentResult.waybill_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-furgonetka-shipment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
