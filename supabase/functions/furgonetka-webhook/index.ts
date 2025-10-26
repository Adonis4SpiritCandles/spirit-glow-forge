import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  package_id: string;
  tracking_number: string;
  status: string;
  carrier: string;
  estimated_delivery_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const webhookSecret = Deno.env.get('FURGONETKA_WEBHOOK_SECRET');
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Unauthorized webhook request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: WebhookPayload = await req.json();
    console.log('Received Furgonetka webhook:', payload);

    // Map Furgonetka status to our shipping_status
    const statusMap: Record<string, string> = {
      'created': 'created',
      'picked_up': 'in_transit',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned'
    };

    const shippingStatus = statusMap[payload.status.toLowerCase()] || payload.status;

    // Update order by tracking number or package id
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id')
      .or(`tracking_number.eq.${payload.tracking_number},furgonetka_package_id.eq.${payload.package_id}`)
      .single();

    if (findError || !order) {
      console.error('Order not found for tracking:', payload.tracking_number);
      throw new Error('Order not found');
    }

    const updateData: any = {
      shipping_status: shippingStatus,
      updated_at: new Date().toISOString(),
    };

    if (payload.estimated_delivery_date) {
      updateData.estimated_delivery_date = payload.estimated_delivery_date;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log(`Order ${order.id} updated with status: ${shippingStatus}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in furgonetka-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
