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

    const { orderId, dimensions: overrideDimensions, weight: overrideWeight }: { orderId: string; dimensions?: { width: number; height: number; length: number }; weight?: number } = await req.json();

    console.log('Fetching order:', orderId, 'with overrides:', { overrideDimensions, overrideWeight });

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order error:', orderError);
      throw new Error('Order not found');
    }

    console.log('Order found:', order.id);

    // Get user profile separately
    const { data: orderUserProfile, error: orderUserProfileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('user_id', order.user_id)
      .single();

    if (orderUserProfileError) {
      console.error('Profile error:', orderUserProfileError);
    }

    console.log('Profile found:', orderUserProfile?.email);

    const weight = Math.max(0.1, Number(overrideWeight ?? 0.5));
    const dimensions = {
      width: Number(overrideDimensions?.width ?? 30),
      height: Number(overrideDimensions?.height ?? 30),
      length: Number(overrideDimensions?.length ?? 30)
    };

    console.log('Creating Furgonetka shipment with data:', {
      orderId,
      service_id: order.service_id,
      carrier_name: order.carrier_name,
      weight,
      dimensions,
      shipping_address: order.shipping_address
    });

    // Get access token via Supabase client
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-furgonetka-token');
    if (tokenError || !tokenData?.access_token) {
      console.error('Token fetch error:', tokenError, tokenData);
      throw new Error('Failed to get Furgonetka token');
    }
    const access_token = tokenData.access_token;

    // Get service_id from order
    if (!order.service_id) {
      throw new Error('No shipping service selected for this order');
    }

    // Prepare shipping address
    const shippingAddress = order.shipping_address || {};
    
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      throw new Error('Missing required shipping address fields');
    }

    // Build sender and receiver using the same schema as calculate-shipping-price
    const sender = {
      name: "Spirit Candle",
      street: "Aleja Krakowska 61",
      city: "Warszawa",
      postcode: "02-180",
      country_code: "PL",
      email: "m5moffice@proton.me",
      phone: "+48501234567"
    };

    // Normalize country code and postcode
    const countryCode = (shippingAddress.country || 'PL').toString().length === 2
      ? (shippingAddress.country || 'PL').toUpperCase()
      : (shippingAddress.country || 'PL');

    const rawPostcode = shippingAddress.postalCode || shippingAddress.post_code || '';
    const normalizedPostcode = (countryCode === 'PL' && rawPostcode)
      ? (() => {
          const digits = String(rawPostcode).replace(/\D/g, '');
          return digits.length === 5 ? `${digits.slice(0,2)}-${digits.slice(2)}` : rawPostcode;
        })()
      : rawPostcode;

    const receiver = {
      name: shippingAddress.name || 'Customer',
      street: shippingAddress.street || '',
      city: shippingAddress.city || '',
      postcode: normalizedPostcode || '',
      country_code: countryCode,
      email: shippingAddress.email || orderUserProfile?.email || '',
      phone: shippingAddress.phone || ''
    };

    // Prepare package payload
    const packagePayload = {
      pickup: sender,
      sender: sender,
      receiver,
      parcels: [{
        weight,
        length: Number(dimensions.length || 30),
        width: Number(dimensions.width || 30),
        height: Number(dimensions.height || 30),
        depth: Number(dimensions.height || 30)
      }],
      type: 'package'
    };

    console.log('Validating package before creation:', JSON.stringify({ service_id: order.service_id, package: packagePayload }));

    // 1) Validate package - if validation returns errors, surface them to client
    try {
      const validateResp = await fetch('https://api.sandbox.furgonetka.pl/packages/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/vnd.furgonetka.v1+json',
          'Accept': 'application/vnd.furgonetka.v1+json',
          'X-Language': 'en_GB',
        },
        body: JSON.stringify({ service_id: order.service_id, package: packagePayload }),
      });
      let validateJson: any = null;
      try { validateJson = await validateResp.clone().json(); } catch (_) {}
      if (!validateResp.ok || (validateJson && Array.isArray(validateJson.errors) && validateJson.errors.length)) {
        console.error('Package validation failed:', validateResp.status, validateResp.statusText, JSON.stringify(validateJson));
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: validateJson?.errors || [{ message: await validateResp.text() }]
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      console.warn('Validation request error (continuing to create):', e);
    }

    // 2) Create package
    const createBody = {
      service_id: order.service_id,
      package: packagePayload,
      reference: orderId,
      cod: false
    };

    console.log('Creating Furgonetka package with body:', JSON.stringify(createBody));

    const shipmentResponse = await fetch('https://api.sandbox.furgonetka.pl/packages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/vnd.furgonetka.v1+json',
        'Accept': 'application/vnd.furgonetka.v1+json',
        'X-Language': 'en_GB',
      },
      body: JSON.stringify(createBody),
    });

    if (!shipmentResponse.ok) {
      const rawText = await shipmentResponse.text();
      let errJson: any = null; try { errJson = JSON.parse(rawText); } catch(_) {}
      console.error('Furgonetka create error:', shipmentResponse.status, shipmentResponse.statusText, rawText);
      throw new Error(`Failed to create shipment: ${shipmentResponse.status} ${shipmentResponse.statusText} ${errJson ? JSON.stringify(errJson) : rawText}`);
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
