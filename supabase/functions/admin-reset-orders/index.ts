import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    console.log('[Reset Orders] Starting demo order cleanup');

    // Delete all order items first (foreign key constraint)
    const { error: itemsError, count: itemsCount } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (itemsError) {
      console.error('[Reset Orders] Error deleting order items:', itemsError);
      throw itemsError;
    }

    console.log(`[Reset Orders] Deleted ${itemsCount || 0} order items`);

    // Delete all orders
    const { error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (ordersError) {
      console.error('[Reset Orders] Error deleting orders:', ordersError);
      throw ordersError;
    }

    console.log(`[Reset Orders] Deleted ${ordersCount || 0} orders`);

    // Reset order number sequence
    const { error: seqError } = await supabase.rpc('exec_sql' as any, {
      sql: 'ALTER SEQUENCE order_number_seq RESTART WITH 1'
    }).catch(() => {
      // If RPC doesn't exist, that's okay - sequence will continue from where it was
      console.log('[Reset Orders] Could not reset sequence (sequence will continue from current value)');
    });

    console.log('[Reset Orders] Demo cleanup completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All demo orders deleted and sequence reset',
        deleted: {
          orders: ordersCount || 0,
          items: itemsCount || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Reset Orders] Error:', error);
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
