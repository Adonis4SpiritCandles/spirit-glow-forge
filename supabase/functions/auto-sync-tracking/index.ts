// file in "supabase/functions/auto-sync-tracking/index.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 SECURITY: Check CRON_SECRET
  const expectedSecret = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('x-cron-secret');
  
  if (!expectedSecret || providedSecret !== expectedSecret) {
    console.error('[Auto-Sync] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[Auto-Sync] CRON_SECRET validated ✓');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Auto-Sync] Starting automatic tracking synchronization');

    // Query orders that need tracking updates
    // - Must have furgonetka_package_id (shipment created)
    // - Either no tracking_number OR shipping_status is not 'delivered'
    // - Created within last 14 days (to avoid processing very old orders)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: ordersToSync, error: queryError } = await supabase
      .from('orders')
      .select('id, order_number, furgonetka_package_id, tracking_number, shipping_status')
      .not('furgonetka_package_id', 'is', null)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .or('tracking_number.is.null,shipping_status.neq.delivered');

    if (queryError) {
      console.error('[Auto-Sync] Error querying orders:', queryError);
      throw queryError;
    }

    if (!ordersToSync || ordersToSync.length === 0) {
      console.log('[Auto-Sync] No orders need tracking sync');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orders need sync',
          syncedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`[Auto-Sync] Found ${ordersToSync.length} orders to sync`);

    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    // Sync each order
    for (const order of ordersToSync) {
      try {
        console.log(`[Auto-Sync] Syncing order #${order.order_number} (${order.id})`);

        // Call the sync-furgonetka-tracking function with service role auth
        const { data: syncResult, error: syncError } = await supabase.functions.invoke(
          'sync-furgonetka-tracking',
          {
            body: { orderId: order.id },
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        if (syncError) {
          console.error(`[Auto-Sync] Failed to sync order ${order.id}:`, syncError);
          results.failed.push({
            orderId: order.id,
            orderNumber: order.order_number,
            error: syncError.message
          });
          continue;
        }

        if (syncResult?.alreadyDelivered) {
          console.log(`[Auto-Sync] Order ${order.id} already delivered, skipping`);
          results.skipped.push({
            orderId: order.id,
            orderNumber: order.order_number,
            reason: 'Already delivered'
          });
          continue;
        }

        console.log(`[Auto-Sync] Successfully synced order ${order.id}`);
        results.success.push({
          orderId: order.id,
          orderNumber: order.order_number,
          trackingNumber: syncResult?.tracking_number,
          status: syncResult?.shipping_status
        });

      } catch (error: any) {
        console.error(`[Auto-Sync] Exception syncing order ${order.id}:`, error);
        results.failed.push({
          orderId: order.id,
          orderNumber: order.order_number,
          error: error.message
        });
      }
    }

    console.log(`[Auto-Sync] Completed: ${results.success.length} synced, ${results.failed.length} failed, ${results.skipped.length} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-sync completed`,
        results: {
          syncedCount: results.success.length,
          failedCount: results.failed.length,
          skippedCount: results.skipped.length,
          details: results
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('[Auto-Sync] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
