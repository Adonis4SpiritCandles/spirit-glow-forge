import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncTrackingRequest {
  orderId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized - Admin access required');
    }

    const { orderId } = await req.json() as SyncTrackingRequest;

    if (!orderId) {
      throw new Error('Missing orderId');
    }

    console.log('Syncing tracking for order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('furgonetka_package_id, tracking_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (!order.furgonetka_package_id) {
      throw new Error('Order has no Furgonetka package ID');
    }

    // Get Furgonetka access token
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
      'get-furgonetka-token',
      {
        body: {},
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (tokenError || !tokenData?.access_token) {
      console.error('Failed to get Furgonetka token:', tokenError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with Furgonetka',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const accessToken = tokenData.access_token;

    // Call Furgonetka API to get package details
    console.log('Fetching package details for:', order.furgonetka_package_id);
    const packageResponse = await fetch(
      `https://api.sandbox.furgonetka.pl/packages/${order.furgonetka_package_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.furgonetka.v1+json',
          'X-Language': 'en_GB',
        },
      }
    );

    if (!packageResponse.ok) {
      const errorText = await packageResponse.text();
      console.error('Furgonetka API error:', {
        status: packageResponse.status,
        statusText: packageResponse.statusText,
        body: errorText,
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Furgonetka API error (${packageResponse.status}): ${errorText || packageResponse.statusText}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const packageData = await packageResponse.json();
    console.log('Package data from Furgonetka:', JSON.stringify(packageData, null, 2));

    // Extract tracking number with multiple fallbacks
    const trackingNumber = packageData.tracking_number 
      || packageData.trackingNumber 
      || packageData.waybill
      || packageData.parcels?.[0]?.package_no
      || packageData.parcels?.[0]?.tracking_number;

    // Extract tracking URL
    const trackingUrl = packageData.tracking_url 
      || packageData.parcels?.[0]?.tracking_url
      || null;

    // Fallback: construct a public tracking URL if API didn't provide one
    const finalTrackingUrl = trackingUrl || (trackingNumber
      ? `https://sandbox.furgonetka.pl/zlokalizuj/${trackingNumber}`
      : null);

    // Extract shipping status
    const shippingStatus = packageData.status 
      || packageData.parcels?.[0]?.state 
      || 'in_transit';

    if (!trackingNumber) {
      console.log('No tracking number available yet for package:', order.furgonetka_package_id);
      console.log('Package structure:', Object.keys(packageData));
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tracking number not yet assigned by Furgonetka. Please try again in a few minutes.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update order with tracking number and URL
    const updateData: any = {
      tracking_number: trackingNumber,
      tracking_url: finalTrackingUrl,
      shipping_status: shippingStatus,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      throw new Error('Failed to update order with tracking number');
    }

    console.log('Successfully synced tracking number:', trackingNumber);

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        tracking_url: finalTrackingUrl,
        status: shippingStatus,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-furgonetka-tracking:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
